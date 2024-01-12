**Please type "I already searched for this issue":**
I already searched for this issue
**Edition:** (pull requests not accepted for previous editions)
2nd
**Book Title:**
objects-classes
**Chapter:**
3
**Section Title:**
Overiding methods
**Topic:**
For the code example (below), shouldn't the result of point.printX(); be x: 3 instead? Given that Point3d is a subclass of Point2d, when Point3d is instantiated as point using the super keyword, it inherits the properties of Point2d:
a. super.getX() refers to the getX() method in Point2d.
b. The getX() method in Point2d returns the x property of Point2d, which is 3.
c. Hence, printX() outputs x: 3.

The code example from the chapter:
class Point2d {
    x = 3
    y = 4

    getX() {
        return this.x;
    }
}

class Point3d extends Point2d {
    x = 21
    y = 10
    z = 5

    getX() {
        return this.x * 2;
    }
    printX() {
        console.log(`x: ${super.getX()}`);
    }
}

var point = new Point3d();

point.printX();       // x: 21

