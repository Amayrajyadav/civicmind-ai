declare module 'jspdf' {
  class jsPDF {
    constructor(...args: any[]);
    addImage(...args: any[]): void;
    getImageProperties(...args: any[]): any;
    internal: any;
    save(...args: any[]): void;
  }
  export { jsPDF };
  export default jsPDF;
}
