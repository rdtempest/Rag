import { Request, TYPES, Connection } from 'tedious';

type ColumnValue = string | number | boolean | Date | null | Buffer;
interface IColumnMetadata {
  colName: string;
  type: {
    name: string;
  };
}

interface StoredProcedureParam {
  name: string;
  type: typeof TYPES[keyof typeof TYPES];
  value: string | number | boolean | Date | null;
}

interface Column {
  metadata: IColumnMetadata;
  value: ColumnValue;
}

async function executeStoredProcedure<T>(
  connection: Connection,
  spName: string,
  params: StoredProcedureParam[]
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const request = new Request(spName, (error: Error | null | undefined, rowCount: number | undefined) => {
      if (error) {
        console.error(error);
        reject(error);
      } else {
        console.log(`${rowCount} rows returned`);
      }
    });

    const results: T[] = [];

    request.on('row', (columns: Column[]) => {
      const row = columns.reduce((acc, column) => ({
        ...acc,
        [column.metadata.colName]: column.value
      }), {} as T);
      results.push(row);
    });


    request.on('requestCompleted', () => {
      console.log('requestCompleted');
      resolve(results);
    });

    request.on('error', (error: Error) => {
      console.error('Error executing stored procedure:', error);
      reject(error);
    });

    params.forEach((param) => {
      request.addParameter(param.name, param.type, param.value);
    });

    connection.callProcedure(request);
  });
}

export default executeStoredProcedure;