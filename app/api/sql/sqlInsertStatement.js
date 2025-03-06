import { Connection, Request, TYPES } from 'tedious';

  
async function sqlInsertStatement(connection, insertStatement) {  


    return new Promise((resolve, reject) => {
        //const x = "INSERT SalesLT.Product (Name, ProductNumber, StandardCost, ListPrice, SellStartDate) OUTPUT INSERTED.ProductID VALUES (@Name, @Number, @Cost, @Price, CURRENT_TIMESTAMP);"
            const request = new Request(insertStatement, function (err) {
            if (err) {
                console.log(err);
            }
        });
        let numberOfArguments = 0;
        connection = arguments[0];
        insertStatement = arguments[1];
        numberOfArguments = (arguments.length / 2) - 1; 

        console.log('**RDT** number of arguments: ' + numberOfArguments);
        console.log('**RDT** insertStatement: ' + insertStatement);
        for (let i = 2; i <= numberOfArguments*2; i+=2) {
            console.log('**RDT** i: ' + i);
            console.log('**RDT** i+1: ' + i+1);
            let argName = arguments[i];
            let argValue = arguments[i + 1];
            let argType = getParameterType(argValue);
            console.log('**RDT** argName: ' + argName);
            console.log('**RDT** argValue: ' + argValue);
            console.log('**RDT** argType: ' + argType);
            request.addParameter(argName, argType, argValue);
        }
        // request.on('row', function (columns) {
        //     columns.forEach(function (column) {
        //         if (column.value === null) {
        //             console.log('NULL');
        //         } else {
        //             console.log("Product id of inserted item is " + column.value);
        //         }
        //     });
        // });

        // Close the connection after the final event emitted by the request, after the callback passes
        request.on("requestCompleted", function (rowCount, more) {
            resolve();
        });
        request.on('error', err => {
            reject(err);
          });
      
        connection.execSql(request);
    });
}
function getParameterType(value) {
    if (typeof value === 'string') {
        return TYPES.NVarChar;
    } else if (typeof value === 'number') {
        return TYPES.Int;
    } else {
        return TYPES.NVarChar;
    }
}
export { sqlInsertStatement };
