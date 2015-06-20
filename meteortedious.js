/**
 * Created by cashbit on 19/06/15.
 *
 * A tedious module wrapper for MSQL connection query and data manipulation (insert,update,delete)
 *
 * see README.md for examples
 *
 */

tdsConnection = function(config){

    var wrappedConnection = Meteor.wrapAsync(asyncConnection);

    return {

        connection : wrappedConnection(config),

        query : function(sql,params){
            return wrappedQuery(this.connection,sql,params||{}) ;
        },

        insert: function(record,tablename){
            var sql = prepareSqlForInsert(record,tablename) ;
            return wrappedQuery(this.connection,sql,record) ;
        },

        update: function(modifier,selector,tablename){
            var sql = prepareSqlForUpdate(modifier,selector,tablename);
            return wrappedQuery(this.connection,sql.sql,sql.params) ;
        },

        delete: function(selector,tablename){
            var sql = prepareSqlForDelete(selector,tablename);
            return wrappedQuery(this.connection,sql.sql,sql.params) ;
        },

        find: function(selector,tablename,resultfields){
            var sql = prepareSqlForFind(selector,tablename,resultfields);
            return wrappedQuery(this.connection,sql.sql,sql.params) ;
        }
    }
}


// internal functions, not exposed

var tedious = Npm.require('tedious') ;

var typeMap = {
    'string'    : tedious.TYPES.NVarChar,
    'boolean'   : tedious.TYPES.Bit,
    'number'    : tedious.TYPES.Float,
    'date'      : tedious.TYPES.DateTime,
    'buffer'    : tedious.TYPES.Binary,
    'object'    : tedious.TYPES.TVP,
    'null'      : tedious.TYPES.Null
}

function asyncConnection(config,cb){

    var callbackCount = 0 ;
    var Connection = tedious.Connection;
    var connection = new Connection(config);
    connection.on('connect', function(err){
        callbackCount++ ;
        if (!err) return cb(null,connection) ;
        if (callbackCount == 2){
            return cb(err) ;
        }
    });
}

function asyncQuery(connection,sql,params,cb){
    var result = [] ;
    function requestResult(err){
        cb(err,result) ;
    }
    var request = new tedious.Request(sql,requestResult);
    request.on('row', function(columns) {
        var row = {} ;
        columns.forEach(function(column) {
            var name = column.metadata.colName ;
            row[name] = column.value ;
        });
        result.push(row) ;
    });

    if (params) addParamsToRequest(request,params) ;

    connection.execSql(request);
}

var wrappedQuery = Meteor.wrapAsync(asyncQuery) ;

function addParamsToRequest(request,params){
    for (var key in params){
        var paramValue = params[key] ;
        var paramType = JSToMSSQLType(paramValue) ;
        if (paramType == tedious.TYPES.Null){
            paramType = tedious.TYPES.NVarChar ;
            paramValue = "" ;
        }
        request.addParameter(key,paramType,paramValue);
    }
}

function JSToMSSQLType(value){
    var jstype = typeof(value) ;
    var mstype = typeMap[jstype] ;
    if (value === null){
        mstype = tedious.TYPES.Null ;
    }
    if (value){
        if (typeof(value.getTime) === 'function'){
            mstype = tedious.TYPES.DateTime ;
        }
    }
    if (!mstype){
        mstype = tedious.TYPES.Null ;
    }
    return mstype ;
}

function prepareSqlForInsert(record,tablename){
    var fieldnames = [] ;
    var paramnames = [] ;
    for (var fieldname in record){
        fieldnames.push(fieldname);
        paramnames.push("@"+fieldname) ;
    }
    var sql = "INSERT INTO <tablename> (<fieldnames>) VALUES (<paramnames>)".
        replace("<tablename>",tablename).
        replace("<fieldnames>",fieldnames.join(",")).
        replace("<paramnames>",paramnames.join(",")) ;
    return sql ;
}

function prepareSqlForUpdate(modifier,selector,tablename){
    var modifierStatements = [] ;
    var params = {} ;
    for (var fieldname in modifier){

        var modifierStatement = "<fieldname> = @modifier_param_<fieldname>".replace("<fieldname>",fieldname).replace("<fieldname>",fieldname) ;
        modifierStatements.push(modifierStatement) ;

        params["modifier_param_"+fieldname] = modifier[fieldname] ;

    }

    if (typeof selector === 'string'){
        var selectorstatements = selector ;
    } else {
        var selectors = [] ;
        for (var fieldname in selector){
            var selectorstatement = "<fieldname> = @selector_param_<fieldname>".replace("<fieldname>",fieldname).replace("<fieldname>",fieldname) ;
            selectors.push(selectorstatement) ;
            params["selector_param_"+fieldname] = selector[fieldname] ;
        }
        var selectorstatements = selectors.join(" AND ") ;
    }

    var sql = "UPDATE <tablename>  SET <modifierstatements> WHERE <selectorstatements> ".
        replace("<tablename>",tablename).
        replace("<modifierstatements>",modifierStatements.join(",")).
        replace("<selectorstatements>",selectorstatements) ;

    return {sql:sql,params:params} ;
}

function prepareSqlForDelete(selector,tablename){

    var params = {} ;

    if (typeof selector === 'string'){
        var selectorstatements = selector ;
    } else {
        var selectors = [] ;
        for (var fieldname in selector){
            var selectorstatement = "<fieldname> = @selector_param_<fieldname>".replace("<fieldname>",fieldname).replace("<fieldname>",fieldname) ;
            selectors.push(selectorstatement) ;
            params["selector_param_"+fieldname] = selector[fieldname] ;
        }
        var selectorstatements = selectors.join(" AND ") ;
    }

    var sql = "DELETE FROM <tablename>  WHERE <selectorstatements> ".
        replace("<tablename>",tablename).
        replace("<selectorstatements>",selectorstatements) ;

    return {sql:sql,params:params} ;
}

function prepareSqlForFind(selector,tablename,resultfields){

    var params = {} ;
    if (typeof selector === 'string'){
        var selectorstatements = selector ;
    } else {
        var selectors = [] ;
        for (var fieldname in selector){
            var selectorstatement = "<fieldname> = @selector_param_<fieldname>".replace("<fieldname>",fieldname).replace("<fieldname>",fieldname) ;
            selectors.push(selectorstatement) ;
            params["selector_param_"+fieldname] = selector[fieldname] ;
        }
        if (selectors.length === 0){
            var selectorstatements = "1=1" ;
        } else {
            var selectorstatements = selectors.join(" AND ") ;
        }
    }
    if (typeof resultfields === 'undefined'){
        var resultfieldnames = "*" ;
    } else if (typeof resultfields === 'string'){
        var resultfieldnames = selector ;
    } else {
        var fieldsWithQuotes = [] ;
        resultfields.forEach(function(resultfield){
            fieldsWithQuotes.push("'"+resultfield+"'") ;
        });
        if (resultfields.length === 0){
            var resultfieldnames = "*" ;
        } else {
            var resultfieldnames = resultfields.join(",") ;
        }
    }

    var sql = "SELECT <resultfieldnames> FROM <tablename>  WHERE <selectorstatements> ".
        replace("<resultfieldnames>",resultfieldnames).
        replace("<tablename>",tablename).
        replace("<selectorstatements>",selectorstatements) ;

    return {sql:sql,params:params} ;
}