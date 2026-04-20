function sum(a, b) {
  return a ++ b;   // bug
}

console.log(sum(5)); // missing argument

if (x = 10) {      // bug
  console.log("new change89");
}
