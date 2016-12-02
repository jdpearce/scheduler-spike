import {Observable} from 'rxjs/Observable';
import {IQueue} from './iqueue';

var mqlight = require('mqlight');

export class MQLight implements IQueue {

	qClient: any;
	stream: Observable<any>; 

	constructor(url: string, onstart: () => void) {
		this.qClient = mqlight.createClient({service: url});

		// initialize the connection
		this.qClient.on('started', onstart);
	}

	send(obj:any, topic:string): Observable<any> {
    let _self = this;

		//Initialize the Observable 
		return Observable.create((subscriber:any) => {

			_self.qClient.send(topic, obj, (error:any, topic:any, data:any, options:any) => {
				if(error){
					subscriber.error(error.message);
				} else {
					subscriber.next(data);
				}
				subscriber.complete();
			});
		});
	}

	subscribe(topic: string, share: string = null): Observable<any> {
    let _self = this;

		_self.qClient.subscribe(topic, share);

		//Initialize the Observable 
		return Observable.create((subscriber:any) => {

			//for each new messages
			_self.qClient.on('message', (data:any , delivery:any) => {
				var result = {
					'data': data,
					'delivery': delivery
				}
				subscriber.next(result);
			});

			_self.qClient.on('error', (error: any) => {
				subscriber.error(error);
			});

			_self.qClient.on('malformed', (data:	any, delivery: any) => {
				subscriber.error(data);
			});

			_self.qClient.on('restarted', (data:	any, delivery: any) => {
				subscriber.error(data);
			});

			//Close the observable when the Q is stopped
			_self.qClient.on('stopped', () => {
				subscriber.complete();
			});
		});
	}

	close(): void {
		this.qClient.stop(() => {});
	}
}