type StoreObject = {
  store: string;
  keyPath: string;
};

type OnSuccesType = {
  key?: any;
  store: string;
  data?: any;
};

type FindOnsucessObj = {
  key: number | string;
  store: string;
};

type DeleteOnsucessObj = FindOnsucessObj;

type AllOnsucess = {
  store: string;
  type: "delete" | "find";
};

interface PutOnsucessResponse {
  message: string;
  success: boolean;
  data: any;
  store: string;
  error?: any;
}
type PutOnsucessObj = {
  data: any;
  store: string;
};
interface FindOnsucessResponse {
  message: string;
  success: boolean;
  data?: any;
  store: string;
  key: number | string;
  error?: any;
}

interface OnSuccessResponse {
  data?: any;
  key?: number | string;
  message: string;
  success: boolean;
  store: string;
  error?: any;
}
type VoidFunction = (param: OnSuccessResponse) => void;

export default class LocalDb {
  stores: StoreObject[];
  dbName: string;
  version: number;
  constructor(stores: StoreObject[], dbName: string, version: number) {
    this.stores = stores;
    this.dbName = dbName;
    this.version = version || 1;
    const promise = new Promise((resolve, reject) => {
      this.initialize(resolve, reject, { store: `${this.stores}` });
    });
  }
  //   initialize
  initialize(resolve: VoidFunction, reject: VoidFunction, obj: OnSuccesType) {
    if (typeof window === "undefined") return console.log("Please Run This Code in Browser/client Side");
    const indexedDB = window.indexedDB;

    if (!indexedDB) {
      console.log("IndexedDB could not be found in this browser.");
      return;
    }
    // 2
    const request = indexedDB.open(this.dbName, this.version);
    request.onerror = this.onError;

    request.onupgradeneeded = (e) => this.onUpgrade(e, this.stores);

    request.onsuccess = (e) => {
      const dataPromise: Promise<OnSuccessResponse> = new Promise((res, rej) => {
        this.onSucess(e, res, rej, obj);
      });
      dataPromise
        .then((data) => {
          if (resolve) resolve(data);
        })
        .catch((err) => {
          if (reject) reject(err);
        });
    };
  }
  //   onUpgarde
  private onUpgrade(event: IDBVersionChangeEvent, stores: StoreObject[]) {
    const request = event.target as IDBRequest;
    const db = request.result;
    if (!stores || stores.length < 1) return console.log("error");
    stores.forEach((element) => {
      db.createObjectStore(element.store, { keyPath: element.keyPath });
    });
  }
  //   onError
  private onError(event: Event) {
    console.error("An error occurred with IndexedDB");
    console.error(event);
  }
  //   onSucess
  private onSucess(event: Event, resolve: VoidFunction, reject: VoidFunction, obj: OnSuccesType) {
    resolve({ message: "Db Open", success: true, store: obj.store });
  }

  private putOnsucess(event: Event, resolve: VoidFunction, reject: VoidFunction, obj: PutOnsucessObj) {
    const request = event.target as IDBRequest;
    const db = request.result;
    const transaction = db.transaction(obj.store, "readwrite");
    //2
    const store = transaction.objectStore(obj.store);
    store.put(obj.data);

    transaction.oncomplete = function () {
      const response: PutOnsucessResponse = { message: "Put Transaction Complete", success: true, data: obj.data, store: obj.store };
      if (resolve) resolve(response);
      db.close();
    };

    transaction.onerror = function () {
      const response: PutOnsucessResponse = { message: "Put Transaction failed", success: false, error: transaction.error, data: obj.data, store: obj.store };
      if (reject) reject(response);
      db.close();
    };
  }

  private findOnsucess(event: Event, resolve: VoidFunction, reject: VoidFunction, obj: FindOnsucessObj) {
    const request = event.target as IDBRequest;
    const db = request.result;
    const transaction = db.transaction(obj.store, "readwrite");
    //2
    const store = transaction.objectStore(obj.store);
    const findData = store.get(obj.key);
    // 5
    findData.onsuccess = function () {
      const data = findData.result;
      console.log(data);
      const response: FindOnsucessResponse = { message: "Find Transaction Complete", success: true, data, store: obj.store, key: obj.key };
      if (resolve) resolve(response);
    };
    transaction.oncomplete = function () {
      db.close();
    };

    transaction.onerror = function () {
      const response: FindOnsucessResponse = { message: "Find Transaction failed", success: false, error: transaction.error, store: obj.store, key: obj.key };
      if (reject) reject(response);
      db.close();
    };
  }

  private deleteOnsucess(event: Event, resolve: VoidFunction, reject: VoidFunction, obj: DeleteOnsucessObj) {
    const request = event.target as IDBRequest;
    const db = request.result;
    const transaction = db.transaction(obj.store, "readwrite");
    //2
    const store = transaction.objectStore(obj.store);

    const deleteRequest = store.delete(obj.key);
    deleteRequest.onsuccess = () => {
      if (resolve) resolve({ message: "Delete Transaction complete", success: true, store: obj.store });
    };

    deleteRequest.onerror = (event: Event) => {
      const target = event.target as IDBRequest;
      if (reject) reject({ message: "Delete Transaction failed", success: false, store: obj.store, error: target.error });
    };

    transaction.oncomplete = () => {
      db.close();
    };
  }

  private allOnsucess(event: Event, resolve: VoidFunction, reject: VoidFunction, obj: AllOnsucess) {
    const request = event.target as IDBRequest;
    const db = request.result;
    const transaction = db.transaction(obj.store, "readwrite");
    //2
    const store = transaction.objectStore(obj.store);
    if (obj.type === "delete") {
      const request = store.clear(); // Clear the entire store

      request.onsuccess = () => {
        if (resolve) resolve({ message: "Store Is cleared", success: true, store: obj.store });
        db.close();
      };

      request.onerror = (event: Event) => {
        const target = event.target as IDBRequest;
        if (reject) reject({ message: "Error in clearing all Data", success: false, store: obj.store, error: target.error });
        db.close();
      };
    } else if (obj.type === "find") {
      const request = store.getAll(); // Get all records

      request.onsuccess = () => {
        if (resolve) resolve({ data: request.result, message: "Find All transaction Complete", success: true, store: obj.store });
        db.close();
      };

      request.onerror = (event: Event) => {
        const target = event.target as IDBRequest;
        if (reject) reject({ message: "Error in Finding Data", success: false, store: obj.store, error: target.error });
        db.close();
      };
    }
  }

  //   findOne
  public async findOne(obj: FindOnsucessObj) {
    console.log("inner", obj);
    this.onSucess = this.findOnsucess;
    const getData: Promise<any> = new Promise((resolve, reject) => {
      this.initialize(resolve, reject, obj);
    });
    const res = await getData;
    return res;
  }

  public async findMany(objects: { key: Array<string | number>; store: string }) {
    this.onSucess = this.findOnsucess;
    let res = [];
    for (let i = 0; i < objects.key.length; i++) {
      const obj: FindOnsucessObj = { key: objects.key[i], store: objects.store };
      const getData: Promise<OnSuccessResponse> = new Promise((resolve, reject) => {
        this.initialize(resolve, reject, obj);
      });
      const data = await getData;
      res.push(data);
    }
    return res;
  }
  public async findAll(store: string) {
    this.onSucess = this.allOnsucess;
    const obj: AllOnsucess = { store: store, type: "find" };
    const findDb: Promise<OnSuccessResponse> = new Promise((resolve, reject) => {
      this.initialize(resolve, reject, obj);
    });
    const res = await findDb;
    return res;
  }

  //   putOne
  public async putOne(obj: PutOnsucessObj) {
    this.onSucess = this.putOnsucess;
    const setData: Promise<OnSuccessResponse> = new Promise((resolve, reject) => {
      this.initialize(resolve, reject, obj);
    });
    const res = await setData;
    return res;
  }
  public async putMany(objects: { store: string; data: [] }) {
    this.onSucess = this.putOnsucess;
    let res = [];
    for (let i = 0; i < objects.data.length; i++) {
      const obj: PutOnsucessObj = { data: objects.data[i], store: objects.store };
      const setData: Promise<OnSuccessResponse> = new Promise((resolve, reject) => {
        this.initialize(resolve, reject, obj);
      });
      const data = await setData;
      res.push(data);
    }
    return res;
  }

  //   delete

  public async deleteOne(obj: DeleteOnsucessObj) {
    this.onSucess = this.deleteOnsucess;
    const deleteDb: Promise<OnSuccessResponse> = new Promise((resolve, reject) => {
      this.initialize(resolve, reject, obj);
    });
    const res = await deleteDb;
    return res;
  }
  public async deleteMany(objects: { key: Array<number | string>; store: string }) {
    this.onSucess = this.deleteOnsucess;
    const res = [];
    for (let i = 0; i < objects.key.length; i++) {
      const obj: DeleteOnsucessObj = { key: objects.key[i], store: objects.store };
      const deleteDb: Promise<OnSuccessResponse> = new Promise((resolve, reject) => {
        this.initialize(resolve, reject, obj);
      });
      const data = await deleteDb;
      res.push(data);
    }
    return res;
  }
  public async deleteAll(store: string) {
    this.onSucess = this.allOnsucess;
    const obj: AllOnsucess = { store: store, type: "delete" };
    const deleteDb: Promise<OnSuccessResponse> = new Promise((resolve, reject) => {
      this.initialize(resolve, reject, obj);
    });
    const res = await deleteDb;
    return res;
  }
}
