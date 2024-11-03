fun git(name){
    Con.Prt("gites " + name)
}

var test = {
    text: "omg", func: git
};

Con.Prt(test.text)
test.func(Con.In("Podaj swoje imię:"))
test["func"]("test")