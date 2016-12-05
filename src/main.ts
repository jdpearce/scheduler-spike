///<reference path="../node_modules/typescript/lib/lib.es6.d.ts"/>
///<reference path="../node_modules/typescript/lib/lib.es2016.d.ts"/>

"use strict";

import { Config } from './config/env.config'
import { RecurrenceRule, RecurrenceSpec, scheduleJob, Job, Range } from 'node-schedule';
import { ScheduledQuery } from './model/scheduledquery';
import {
  ScheduledQueryRepository,
  ScheduledQueryJsonRepository
} from './model/scheduledqueryrepository';
import { ScheduledTime } from './model/scheduledtime';
import { Observable } from 'rxjs/Observable';
import { Alert } from './model/alert';
import 'rxjs/add/operator/map';
import * as path from 'path';

Config.Root = path.dirname(require.main.filename);

let jobs: Job[] = [];
let repository: ScheduledQueryRepository = new ScheduledQueryJsonRepository(Config);
repository.getAll().subscribe((squerys: ScheduledQuery[]) => {

  for (let squery of squerys) {
    let rules = squery.getRecurrenceRules();

    for (let i = 0; i < rules.length; i++) {
      let jobName = `${squery.serviceName} - [${i}]`;
      let job = scheduleJob(jobName, rules[i], () => {
        console.log(`${new Date()} : Running ${jobName} - ${this.query}`);
      });
      jobs.push(job);
    }
  }

  console.log(`${new Date()} : ${jobs.length} jobs created from ${squerys.length} scheduled queries.`);
  console.log(`${new Date()} : Query scheduler started.`);  
},
(err: any) => console.error(`${Date.now()} : Error loading scheduled queries - ${err}.`),
() => {});
