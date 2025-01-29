# LOCAL DB

## START

```
import { LocalDb } from "uchiha-madara";
 const newDb = new LocalDb([{ store: your-store, keyPath: your-key }], db-name, version-number);
```

## Put

### putOne

```
const res = await db.putOne({ store: your-store, data: your-data-with-key });
```

### putMany

```
const res = await db.putMany({ store: your-store, data: [your-data-with-key] });
```

### Response

```
{
  message: string;
  success: boolean;
  data: any;
  store: string;
  error?: any;
}
```

## Find

### findOne

```
 const data = await db.findOne({ store:your-store , key: your-key });
```

### findMany

```
 const data = await db.findMany({ store:your-store , key: [your-key,key,key ]});
```

### findAll

```
 const data = await db.findAll(store:your-store );
```

### Response

```
{
  message: string;
  success: boolean;
  data?: any;
  store: string;
  key: number | string;
  error?: any;
}
```

## Delete

### deleteOne

```
  const data = await db.deleteOne({ store: store-name, key: key });
```

### deleteMany

```
 const data = await db.deleteMany({ store: store-name, key: [key,key,key...] });
```

### deleteAll

```
  const data = await db.deleteAll(store-name);
```

### Response

```
{
  message: string;
  success: boolean;
  store: string;
  key: number | string;
  error?: any;
}
```
