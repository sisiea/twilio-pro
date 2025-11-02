declare global {
    // 扩展全局对象
    // eslint-disable-next-line no-var
    var broadcastWS: ((data: any) => void) | undefined;
  }
  
  export {};
  