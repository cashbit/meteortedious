# Meteortedious

A tedious module wrapper for MSQL connection query and data manipulation (insert,update,delete)

## Example code

```
// Create a configuration option object

var config = {
    server: 'YOURSERVER',
    userName: 'YOURUSER',
    password: 'YOURPASSWORD',
    options: {
        instanceName: 'YOURINSTANCENAME', database: 'YOURDBNAME'
        //encrypt: true // for Azure users
    }
};

// user try to handle possible errors, connecting or executing queries

try{

	// make the connection
    var sqlServerConnection = new tdsConnection(config) ;

   	// executing more than one sql statement
    var sqls=[
    	"DELETE FROM items",
    	"INSERT INTO items (code, description) VALUES (1,'bar')"
    ];
    
	var currentSql ;
    sqls.forEach(function(sql,index){
        currentSql = sql ;
        
        // calling query method one time for each sql statement 
        var result = sqlServerConnection.query(currentSql) ;
        
        console.log("result:" + index,result) ;
    }) ;

    delete(currentSql) ;


	// instead of using sql statements you can use helper metods
	
	// inserting records
    var insertObj = {
        code: '2',
        description: 'foo'
    }
    var result = sqlServerConnection.insert(insertObj,'items') ;
    console.log("insert result:", result) ;

	// updating records
    var updateObj = {
        description : 'foobar'
    };
	// update only the items with code === 2
    var updateSelector = {
        code: '2'
    };

    var result = sqlServerConnection.update(updateObj,updateSelector,'items') ;
    console.log("update result:", result) ;


	// deleting records
    var deleteSelector = {
        code: '1'
    }

    var result = sqlServerConnection.delete(deleteSelector,'items') ;
    console.log("delete result:", result) ;

	// searching records
    var findSelector = {
        code: '2'
    }
    var result = sqlServerConnection.find(findSelector,'items') ;
    console.log("find result:", result) ;


} catch (err){

	// handling error 
    console.log("sql error",err) ;
    if (currentSql) console.log("executing",currentSql) ;

}
```

For more info go to [https://github.com/cashbit/meteortedious](https://github.com/cashbit/meteortedious) and see inside the code.