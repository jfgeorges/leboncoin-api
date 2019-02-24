const obj = { a: 1, b: 2, c: 3, d: 4 };

const obj2 = (({ a, c }) => ({ a, c }))(obj);
console.log(obj2);
