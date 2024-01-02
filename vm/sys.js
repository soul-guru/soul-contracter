function safeSignal(functionName, context, ...args) {
  const namespaces = functionName.split(".");
  const func = namespaces.pop();

  if (func && context[func] != null) {
    for (let i = 0; i < namespaces.length; i++) {
      context = context[namespaces[i]];
    }

    return context[func].apply(null, args);
  }
}

log("SYS SAY HELLO!")

function roughSizeOfObject(object) {
  const objectList = [];
  const stack = [object];
  let bytes = 0;

  while (stack.length) {
    const value = stack.pop();

    switch (typeof value) {
      case 'boolean':
        bytes += 4;
        break;
      case 'string':
        bytes += value.length * 2;
        break;
      case 'number':
        bytes += 8;
        break;
      case 'object':
        if (!objectList.includes(value)) {
          objectList.push(value);
          for (const prop in value) {
            if (value.hasOwnProperty(prop)) {
              stack.push(value[prop]);
            }
          }
        }
        break;
    }
  }

  return bytes;
}

//
// const axios = {
//   get: axios_get,
//   post: axios_post,
//   put: axios_put,
//   delete: axios_delete,
// }

log({context: Object.getOwnPropertyNames(this)})

// $LayerToxicity("hello")

// layer("LayerToxicity").then(log)
// axios.get("http://localhost").then(log)