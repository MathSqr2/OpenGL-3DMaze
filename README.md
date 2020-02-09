# 3D Maze buit in OpenGL

![alt text](https://i.imgur.com/9lNRHi6.png "1")

This is a simple 3D Maze built in OpenGl using resources provided on the MIECT Computer Graphics course. Its based on basic blocks that, through some modeling get to represent the maze.

## Run

You need OpenGL to work on your browser.

## Goals achieved

**1.**   The deployment of the maze is done with a maze representing Floor(0), Walls (1) and End Wall (2).

```
map = [
    [1,1,1,1,1,1,1,1,1,1,1,2,1],
    [1,0,0,0,1,1,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,0,1,1,1,1,0,1],
    [1,0,1,0,1,1,0,0,0,1,0,0,1],
    [1,0,0,0,0,1,0,1,0,0,0,1,1],
    [1,0,1,1,1,1,1,0,1,1,1,1,1],
    [1,0,1,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,0,0,1,0,0,0,1,0,1],
    [1,0,0,0,0,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,1,1,1,1,1],
    [1,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1],
];
```

**2.**   Colisions are somewhat good but sometimes players get in walls for a bit but nothing worrying.

**3.**   There's music to keep the players entertained

## Some images

![alt text](https://i.imgur.com/DgIBt9W.png "Mid")
![alt text](https://i.imgur.com/nkne9mM.png "End wall")

## Authors

* **Afonso Guimarães** [afonso.guima@ua.pt]

* **Vasco Cardoso** [vasco.cardoso16@ua.pt]