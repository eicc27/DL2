export interface Code {
  userName: string;
  name: string;
  acc: string;
  time: string;
}
export default interface Dataset {
  userCodes: Code[];
  name: string;
  intro: string;
  task: string;
  userName: string;
  uploadTime: string;
}
