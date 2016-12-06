import { ScheduledQuery } from './scheduledquery';
import { Alert } from './alert';
import { IConfig } from '../config/iconfig';
import * as rx from 'rxjs';

let sql = require('msnodesqlv8');


export class ScheduledQueryRunner {
  private connectionString: string;
  private mq: any;

  constructor(private config: IConfig) {
    this.connectionString = `Driver={SQL Server Native Client 11.0};Server=${config.SqlInstance};Trusted_Connection={Yes};Database={${config.SqlDatabase}}`;
  }

  private errorAlert(squery: ScheduledQuery, error: any): void {
    console.log(`${new Date().toTimeString()}: Error in "${squery.serviceName}" - ${JSON.stringify(error)}`);
  }

  run(squery: ScheduledQuery): void {
    console.log(`${new Date().toTimeString()}: Starting "${squery.serviceName}"`)
    sql.open(this.connectionString, (err: any, conn: any) => {

      if (err) {
        this.errorAlert(squery, err);
        return;
      }

      let done: boolean = false;
      let q = conn.query(squery.query, (qerr: any, results: any[]) => {
        if (done) {
          console.log(`${new Date().toTimeString()}: Completed "${squery.serviceName}" - ${JSON.stringify(results)}`)
        }
      });

      q.on('error', (qerr: any) => {
        this.errorAlert(squery, qerr);
      })

      q.on('done', () => {
        done = true;
      });
    });
  }
}
