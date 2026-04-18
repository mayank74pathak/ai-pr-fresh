function sum(a, b) {
  return a + b;
}

console.log(sum(5)); // missing argument

if ((x = 10)) {
  // ❌ assignment instead of comparison
  console.log("x is 10");
