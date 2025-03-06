import {  Request, TYPES } from 'tedious';

async function sqlSelectStatement(connection, query) {
  return new Promise((resolve, reject) => {
    const request = new Request(query, (err, rowCount) => {
      if (err) {
        reject(err);
      } else {
        console.log(`Query completed with ${rowCount} row(s) affected`);
      }
    });

    const rows = [];

    request.on('row', columns => {
      const row = {};
      columns.forEach((column) => {
        const columnName = column.metadata.colName;
        const columnType = column.metadata.type;
        const columnValue = getValueForType(column.value, columnType);
        row[columnName] = columnValue;
      });
      rows.push(row);
    });

    request.on('requestCompleted', () => {
      resolve(rows);
    });

    request.on('error', err => {
      reject(err);
    });

    connection.execSql(request);
  });
}

function getValueForType(value, type) {
  switch (type.type) {
    case TYPES.VarChar.id:
    case TYPES.Text.id:
    case TYPES.NVarChar.id:
    case TYPES.NText.id:
      return value.toString();
    case TYPES.Int.id:
    case TYPES.TinyInt.id:
    case TYPES.SmallInt.id:
    case TYPES.BigInt.id:
      return parseInt(value, 10);
    case TYPES.Bit.id:
      return !!value;
    case TYPES.Numeric.id:
    case TYPES.Decimal.id:
    case TYPES.Money.id:
    case TYPES.SmallMoney.id:
      return parseFloat(value);
    case TYPES.Float.id:
    case TYPES.Real.id:
      return parseFloat(value);
    case TYPES.Date.id:
    case TYPES.DateTime.id:
    case TYPES.DateTime2.id:
    case TYPES.DateTimeOffset.id:
    case TYPES.SmallDateTime.id:
      return new Date(value);
    case TYPES.UniqueIdentifier.id:
      return value.toString();
    default:
      return value;
  }
}
export { sqlSelectStatement };
