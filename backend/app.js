const math = require('./math'); // import the math module
const fs = require('fs'); // import the fs module file system module
const os = require('os'); // import the os module
const path = require('path'); // import the path module
const chalk = require('chalk'); // import the chalk module

console.log(math.add(2, 3)); 
console.log(math.sub(5, 2)); 

// fs - file system
// create file

fs.writeFileSync("demo.txt", "Santhosh Chowdary"); // write to a file demo.txt with the content "Santhosh Chowdary"

// read file

let data = fs.readFileSync("demo.txt", "utf-8"); // read the content of demo.txt and store it in the variable data
console.log(data); // print the content of the file

// append data
fs.appendFileSync("demo.txt", "\nWelcome to Node.js"); // append the text "Welcome to Node.js" to the file demo.txt

// fs.unlinkSync("demo.txt"); // delete the file demo.txt

console.log(os.platform()); // print the operating system platform
console.log(os.arch()); // print the CPU architecture
console.log(os.cpus()); // print the CPU information
console.log(os.hostname()); // print the hostname of the operating system
console.log(os.freemem()); // print the free memory in bytes
console.log(os.totalmem()); // print the total memory in bytes

let filePath = path.join(__dirname, "folder", "file.txt"); // create a file path by joining the current directory, folder, and file.txt
console.log(filePath); // print the file path

let file = path.basename("/home/user/file.txt"); // get the base name of the file from the path 
console.log(file); // print the base name of the file

let dir = path.dirname("/home/user/file.txt"); // get the directory name from the path
console.log(dir); // print the directory name

let ext = path.extname("/home/user/file.txt"); // get the extension of the file from the path
console.log(ext); // print the extension of the file
console.log(__dirname); // print the current directory name

console.log(chalk.green("This is green text")); // print the text "This is green text" in green color
console.log(chalk.red("Error: Something went wrong")); // print the text "Error: Something went wrong" in red color
