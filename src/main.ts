///<reference path="../node_modules/typescript/lib/lib.es6.d.ts"/>
///<reference path="../node_modules/typescript/lib/lib.es2016.d.ts"/>

"use strict";

import { Config } from './config/env.config'
import { RecurrenceRule, RecurrenceSpec, scheduleJob, Job, Range } from 'node-schedule';
import { SqlServerDB } from './model/sqlserverdb';
import { ScheduledQuery } from './model/scheduledquery';
import { ScheduledTime } from './model/scheduledtime';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

let db: SqlServerDB = new SqlServerDB(Config.SqlInstance, Config.SqlDatabase);
let jobs: Job[] = [];

// get the list of queries to run
db.select(Config.ScheduledQuerySql)
  .map(result => ScheduledQuery.fromSqlResults(result))
  .subscribe((squerys: ScheduledQuery[]) => {

    for (let squery of squerys) {
      let rules = squery.getRecurrenceRules();

      for (let i = 0; i < rules.length; i++) {
        let jobName = `${squery.processName} - [${i}]`;
        let job = scheduleJob(jobName, rules[i], () => {
          console.log(`${new Date()} : Running ${jobName} - ${squery.query}`);
        });

        jobs.push(job);
      }
    }

    console.log(JSON.stringify(jobs));
  },
  (err: any) => console.error(err),
  () => { });
