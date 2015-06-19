/**
 * Created by cashbit on 19/06/15.
 */

console.log("Start") ;

sqlServerConnection = {
    query : function(sql){

        var tedious = Npm.require('tedious') ;

        var Connection = tedious.Connection;
        var Request = tedious.Request;
        var TYPES = tedious.TYPES;

        var config = {
            server: 'ITASMISQL01.SIAD.LCL',
            userName: '0459',
            password: 'LOGK330',
            options: {
                debug: {
                    packet: true,
                    data: true,
                    payload: true,
                    token: false,
                    log: true
                },
                instanceName: 'LNITA', database: 'erplndb'
                //instanceName: 'SMIPROD', database: '0430'
                //encrypt: true // for Azure users
            }
        };

        var connection = new Connection(config);

        connection.on('connect', function(err) {
                // If no error, then good to go...
                if (err) return console.log("connect",err) ;
                executeStatement(function(err){
                    if (err) console.log("Error:",err);
                    connection.close();
                });
            }
        );

        /*
         connection.on('debug', function(text) {
         console.log(text);
         }
         );
         */

        connection.on('error', function(err) {
                console.log(err);
            }
        );

        function executeStatement(cb) {

            //request = new Request("select 42, 'hello world'", function(err, rowCount) {
            var request = new Request(sql,
                function(err){
                    cb(err);
                }
            );/*
             var request = new Request("INSERT INTO tinsms100872 (t_cdec, t_paym, t_pfbp, t_itbp,t_stbp, t_bask, t_basn, t_ofbp, t_Refcntu, t_qdat) VALUES ('01E','IAM','0','0','0',@nVarCharVal,'0','0','0','2014-12-10 09:43:03')",
             function(err){
             if(err){
             cb(err) ;
             };
             }
             );
             */
            //request.addParameter('uniqueIdVal', TYPES.UniqueIdentifierN,'ba46b824-487b-4e7d-8fb9-703acdf954e5');
            //request.addParameter('intVal', TYPES.Int, 435);
            //request.addParameter('nVarCharVal', TYPES.NVarChar, 'test1');

            request.on('row', function(columns) {
                var row = {} ;
                columns.forEach(function(column) {
                    var name = column.metadata.colName ;
                    row[name] = column.value ;
                });
                console.log(row) ;
            });

            request.on('done', function(rowCount, more) {
                console.log(rowCount + ' rows returned (done)');
                cb()
            });

            request.on('end', function(rowCount, more) {
                console.log(rowCount + ' rows returned (end)');
                cb()
            });

            connection.execSql(request);

        }
    }
}








