class SecretCode {
    constructor(tWidth, tHeight, tId) {
        this._tWidth = tWidth;
        this._tHeight = tHeight;
        this._tId = tId;
        this._colors = ["red", "yellow", "green", "blue", "orange", "violet"];
        var table = document.getElementById(tId);
        for (var i = 0; i < tHeight; i++) {
            var tr = document.createElement("tr");
            tr.style.textAlign = "center";
            for (var j = 0; j < tWidth; j++) {
                var td = document.createElement("td");
                td.id = (tId + "_case " + i + "-" + j);
                td.style.height = "40px";
                td.style.width = "40px";
                td.style.border = "0";
                td.style.borderRadius = "50%";
                td.style.fontSize = "10px";
                tr.appendChild(td);
                
            }
            table.appendChild(tr);
        }
    }
}

// Game Class
class Grid extends EventEmitter {
    constructor(tWidth, tHeight, tId, mode) {
        super();
        this._tWidth = tWidth;
        this._tHeight = tHeight;
        this._tId = tId;
        this._colors = [];
        this._colorsCopy = [];
        this._code = [];
        this._codeAVerifier = [];
        this._x = 0;
        this._y = 0;
        this._pin0 = 0;
        this._pin1 = 1;
        this._codeCopy = this._code.slice();
        this._clickable = true;
        this._mode = mode;

        //generate master secret code
        if (this._mode == "maitre") {
            this._colors = ["red", "yellow", "green", "blue", "orange", "violet", "black", "white"];
            this._colorsCopy = this._colors.slice();

            for (let i = 0; i < 4; i++) {
                var randNbr = Math.floor(Math.random() * this._colorsCopy.length);
                this._code.push(this._colorsCopy[randNbr]);
            }
            this._codeCopy = this._code.slice()
        }

        //generate easy secret code
        if (this._mode == "facile") {
            this._colors = ["red", "yellow", "green", "blue", "orange", "violet"];
            this._colorsCopy = this._colors.slice();

            for (let i = 0; i < 4; i++) {
                var randNbr = Math.floor(Math.random() * this._colorsCopy.length);
                this._code.push(this._colorsCopy[randNbr]);
                this._colorsCopy.splice(randNbr, 1);
            }
            this._codeCopy = this._code.slice();
        }

        var table = document.getElementById(tId);
        for (var i = 0; i < tHeight; i++) {
            var tr = document.createElement("tr");

            for (var j = 0; j < tWidth; j++) {
                var td = document.createElement("td");
                td.id = (tId + "_case_" + i + "-" + j);
                td.style.height = "40px";
                td.style.width = "40px";
                td.style.border = "0";
                td.style.borderRadius = "50%";
                td.style.fontSize = "10px";
                td.style.backgroundColor = "#C7BF8D";
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }

        var boutons = document.getElementById("boutons");
        for (var b = 0; b < this._colors.length; b++) {
            var btn = document.createElement("button");
            btn.id = this._colors[b];
            btn.style.height = "50px";
            btn.style.width = "50px";
            btn.style.border = "0";
            btn.style.borderRadius = "50%";
            btn.style.margin = "0 5px"
            btn.style.backgroundColor = this._colors[b];
            btn.classList.add("clrBtns");
            btn.dataset.color = this._colors[b];
            btn.onclick = (e) => this.emit("clicked", e.target.dataset.color);
            boutons.appendChild(btn);
        }


        // On event "perdu" => show modal
        this.on("perdu", () => {
            window.setTimeout(() => {
                Swal.fire({
                    icon: 'error',
                    title: 'Dommage !',
                    text: 'Vous avez perdu!',
                    onAfterClose: () => {
                        location.reload();
                    }
                })
            }, 0)
        });

        // On event "gagné" => show modal
        this.on("gagné", () => {
            window.setTimeout(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Bravo !',
                    text: 'Vous avez gagné!',
                    onAfterClose: () => {
                        location.reload();
                    }
                })
            }, 0)
        });

        // Color buttons clicked event
        this.on("clicked", (c) => {
            if (this._clickable == true) {
                var caseId = ("myTable_case_" + this._x + "-" + this._y);
                document.getElementById(caseId).style.backgroundColor = c;
                this._codeAVerifier.push(c);
                if (this._x == 11 && this._y == 3) {
                    this.emit("perdu");
                    this._clickable = false;
                }
                this._y++;
                if (this._y >= 4) {
                    this._y = 0;
                    this.verify();
                    this._x++;
                }
            }
        });
    }

    //compare code line with secret code
    verify() {

        //Black pins
        for (var i = 0; i < this._codeAVerifier.length; i++) {
            if (this._codeAVerifier[i] == this._codeCopy[i]) {
                document.getElementById('pin_' + this._pin0 + this._pin1).style.backgroundColor = "black";
                this._codeAVerifier.splice(i, 1);
                this._codeCopy.splice(i, 1);
                i--;
                this._pin1++;
            }
        }

        //Red pins
        for (var i = 0; i < this._codeAVerifier.length; i++) {
            for (var j = 0; j < this._codeCopy.length; j++) {
                if (this._codeAVerifier[i] == this._codeCopy[j]) {
                    document.getElementById('pin_' + this._pin0 + this._pin1).style.backgroundColor = "red";
                    this._codeAVerifier.splice(i, 1);
                    this._codeCopy.splice(j, 1);
                    i--;
                    j = this._codeCopy.length;
                    this._pin1++;
                }
            }
        }

        // Win conditions
        if (document.getElementById('pin_' + this._pin0 + '1').style.backgroundColor == "black" &&
            document.getElementById('pin_' + this._pin0 + '2').style.backgroundColor == "black" &&
            document.getElementById('pin_' + this._pin0 + '3').style.backgroundColor == "black" &&
            document.getElementById('pin_' + this._pin0 + '4').style.backgroundColor == "black") {
            this.emit("gagné")
        }

        this._y++;
        this._pin1 = 1;
        this._y = 0;
        this._pin0++;
        this._codeCopy = this._code.slice();
        this._codeAVerifier = [];
    }
}

//Show black and red pins
class Scores {
    constructor(tHeight) {

        this._tHeight = tHeight;

        var table = document.getElementById("scores");
        for (var i = 0; i < tHeight; i++) {
            var tr = document.createElement("tr");
            var td = document.createElement("td");
            td.id = ("case " + i);
            td.style.height = "40px";
            td.style.width = "120px";
            td.style.verticalAlign = "bottom"
            tr.appendChild(td);
            td.style.border = "0";
            td.style.borderRadius = "50%";
            td.style.margin = 0;
            td.style.padding = 0;
            table.appendChild(tr);

            var jk = 1;
            var results = document.getElementById(td.id);
            for (var j = 0; j < 1; j++) {
                var tr = document.createElement("tr");
                for (var k = 0; k < 4; k++) {
                    var td = document.createElement("td");
                    td.id = ("pin_" + i + jk);
                    td.style.height = "25px";
                    td.style.width = "25px";
                    td.style.margin = 0;
                    td.style.padding = 0;
                    td.style.borderRadius = "50%";
                    tr.appendChild(td);
                    td.style.backgroundColor = "#C7BF8D";

                    jk++;
                }
                results.appendChild(tr);
            }
        }
    }
}

window.onload = () => {

    // difficulty buttons
    document.getElementById("facile").onclick = () => {
        document.getElementById('code').innerHTML = '';
        document.getElementById('myTable').innerHTML = '';
        document.getElementById('scores').innerHTML = '';
        document.getElementById('boutons').innerHTML = '';
        var g = new Grid(4, 12, "myTable", "facile");
        var S = new Scores(12);
        var code = new SecretCode(4, 1, "code");
        document.getElementById("functionBtns").style.display = "block";
        // Display secret code
        code = g._code;
        for (var i = 0; i < code.length; i++) {
            document.getElementById("code_case 0-" + i).style.backgroundColor = code[i];
        }
        //Hide secret code
        document.getElementById("code").style.display = "none";

        // Buttons functions
        document.getElementById("recommencer").onclick = () => {
            location.reload();
        }
        document.getElementById("showSoluce").onclick = () => {
            document.getElementById("code").style.display = "block";
            g._clickable = false;
        }
    }
    document.getElementById("maitre").onclick = () => {
        document.getElementById("code").innerHTML = "";
        document.getElementById("myTable").innerHTML = "";
        document.getElementById("scores").innerHTML = "";
        document.getElementById("boutons").innerHTML = "";
        var g = new Grid(4, 10, "myTable", "maitre");
        var S = new Scores(10);
        var code = new SecretCode(4, 1, "code");
        document.getElementById("functionBtns").style.display = "block";

        // Display secret code
        code = g._code;
        for (var i = 0; i < code.length; i++) {
            document.getElementById("code_case 0-" + i).style.backgroundColor = code[i];
        }
        //Hide secret code
        document.getElementById("code").style.display = "none";

        // Buttons functions
        document.getElementById("recommencer").onclick = () => {
            location.reload();
        }
        document.getElementById("showSoluce").onclick = () => {
            document.getElementById("code").style.display = "inline-block";
            g._clickable = false;
        }
    }


}