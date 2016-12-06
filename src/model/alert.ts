import * as uuid from 'uuid';

export class Alert {
  static readonly CRITICAL:string = "CRITICAL";
  static readonly WARNING: string = "WARNING";
  static readonly ERROR: string = "ERROR";
  static readonly OK: string = "OK";

  public title: string;
  public service: string = "";
  public serviceInError: string = "";
  public correlationId: string;
  public timeUID: string;
  public businessImpact: string = "";
  public technicalImpact: string = "";
  public severity: string = "";
  public timeStampUTC: Date;
  public host: string = "";
  public additionalInformation: string = "";
  public owner: string = "";
  public status: string = "";
  public modifiedUTC: Date;

  constructor(params: any) {
    this.timeStampUTC = new Date();
    this.modifiedUTC = new Date();
    this.timeUID = uuid.v1();
    this.correlationId = this.correlationId || this.timeUID;

    // params can override the values above
    Object.assign(this, params);
  }
}