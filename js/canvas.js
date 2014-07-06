// Define a class like this
function CanvasManager(name, gender){

   // Add object properties like this
   this.name = name;
   this.gender = gender;
}

// Add methods like this.  All Person objects will be able to invoke this
CanvasManager.prototype.speak = function(){
    alert("Howdy, my name is" + this.name);
}

// Instantiate new objects with 'new'
//var CanvasManager = new Person("Bob", "M");

// Invoke methods like this
//person.speak(); 