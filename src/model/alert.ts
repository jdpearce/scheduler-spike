import * as uuid from 'uuid';

export class Alert {
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

  constructor(title: string, correlationId: string = null) {
    this.title = title;
    this.timeStampUTC = new Date();
    this.modifiedUTC = new Date();
    this.timeUID = uuid.v1();
    this.correlationId = correlationId || this.timeUID;
  }
}