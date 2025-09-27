console.log("script.js loaded");


const page = 'visualizations.htmnl'
const canvas = document.getElementById("canvas");
let positions = null;

console.log(canvas);

for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 5; y++){
        
        const temp = document.createElementNS('http://www.w3.org/2000/svg', "rect");
        temp.setAttribute("x", 5+(20*y));
        temp.setAttribute("y", 5 + (20*x));
        temp.setAttribute("width", 10);
        temp.setAttribute("height", 10);
        temp.setAttribute("fill", 'blue');
        canvas.appendChild(temp);
        
        
    }
};

for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 4; y++){
        const temp = document.createElementNS('http://www.w3.org/2000/svg', "rect");
        temp.setAttribute("x", 15+(20*y));
        temp.setAttribute("y", 15 + (20*(x)));
        temp.setAttribute("width", 10);
        temp.setAttribute("height", 10);
        temp.setAttribute("fill", 'red');
        canvas.appendChild(temp);
    }
};


const square = document.querySelectorAll("rect");
const colors = ['pink', 'orange', 'Gold', 'green', 'CornflowerBlue', 'violet', 'brown', 'lightblue', 'Fuchsia', 'lightgreen']

square.forEach((squares) => {
    squares.addEventListener("click", () => {
        let randomColor = Math.floor((Math.random()*10));
                console.log(randomColor);
        squares.setAttribute("fill", colors[randomColor]);
        console.log(colors[randomColor]);
    }
    )})


