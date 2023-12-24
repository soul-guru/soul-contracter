function safeSignal(functionName, context, ...args) {
  var namespaces = functionName.split(".");
  var func = namespaces.pop();

  if (context[func]) {
    for (var i = 0; i < namespaces.length; i++) {
      context = context[namespaces[i]];
    }

    return context[func].apply(null, args);
  }
}
