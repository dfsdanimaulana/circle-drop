/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import Matter from "matter-js"
import { Howl } from "howler"

import { onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth"
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, where, getDocs } from "firebase/firestore"

import { auth, db } from "./firebase.js"

// handle signup user with gmail
const signInGoogle = async () => {
    const provider = new GoogleAuthProvider()

    try {
        const cred = await signInWithPopup(auth, provider)
        const user = cred.user

        // User signed up successfully with Google
        const data = {
            uid: user.uid,
            displayName: user.displayName,
            score: 0,
        }
        createUserData(data)
    } catch (error) {
        // Handle any errors that occurred during the sign-up process
        console.log(error)
    }
}
const signInGithub = async () => {
    const provider = new GithubAuthProvider()

    try {
        const cred = await signInWithPopup(auth, provider)
        const user = cred.user

        // User signed up successfully with Github
        const data = {
            uid: user.uid,
            displayName: user.displayName,
            score: 0,
        }
        createUserData(data)
    } catch (error) {
        // Handle any errors that occurred during the sign-up process
        console.log(error)
    }
}

const googleButton = document.querySelector("#sign-in-google")
const githubButton = document.querySelector("#sign-in-github")
const signOutButton = document.querySelector("#sign-out")

const profileCard = document.querySelector(".profile")
const profileName = document.querySelector("#profile-name")
const profileScore = document.querySelector("#profile-score")

function setProfile(data) {
    profileName.textContent = data.displayName
    profileScore.textContent = data.score
}

let currentUser = null
onAuthStateChanged(
    auth,
    (user) => {
        if (user) {
            console.log(user)
            currentUser = user
            userExists()
        } else {
            currentUser = null
            userNotExists()
        }
    },
    (err) => {
        console.log(err)
    },
)

// data for testing
currentUser = {
    uid: "test",
    displayName: "test",
    score: 0,
}

googleButton.addEventListener("click", () => {
    signInGoogle()
})
githubButton.addEventListener("click", () => {
    signInGithub()
})
signOutButton.addEventListener("click", () => {
    signOut(auth)
})

function userExists() {
    googleButton.style.display = "none"
    githubButton.style.display = "none"
    signOutButton.style.display = "flex"
    profileCard.style.display = "flex"
}

function userNotExists() {
    googleButton.style.display = "flex"
    githubButton.style.display = "flex"
    signOutButton.style.display = "none"
    profileCard.style.display = "none"
}

const colRef = collection(db, "scores")

const q = query(colRef, orderBy("score", "desc"))
onSnapshot(q, (snapshot) => {
    snapshot.docs.forEach((doc) => {
        if (currentUser) {
            if (currentUser.uid === doc.data().uid) {
                setProfile(doc.data())
            }
        }

        console.log(doc.data())
    })
})

async function createUserData(data) {
    try {
        // Define the "uid" value you want to search for
        const targetUid = data.uid

        // Reference the collection you want to query
        const collectionRef = collection(db, "scores")

        // Create a query to find documents with the specified "uid"
        const q = query(collectionRef, where("uid", "==", targetUid))

        const querySnapshot = await getDocs(q)
        if (!querySnapshot.empty) {
            // At least one document with the specified "uid" exists
            querySnapshot.forEach((doc) => {
                console.log(doc.data())
            })
        } else {
            // No document with the specified "uid" was found
            const res = await addDoc(colRef, data)
            console.log("User data created", res)
        }
    } catch (err) {
        console.log(err)
    }
}

window.addEventListener("load", () => {
    // listen to auth user

    // module aliases
    const { Engine, Render, Runner, Bodies, Body, Constraint, Events, Composite, Mouse, MouseConstraint } = Matter

    // check if viewport is mobile or not
    const maxDesktopWidth = 430
    const isMobile = window.innerWidth <= 768

    const canvasWidth = isMobile ? window.innerWidth : maxDesktopWidth
    const canvasHeight = window.innerHeight

    const canvas = document.getElementById("myCanvas"),
        CW = (canvas.width = canvasWidth),
        CH = (canvas.height = canvasHeight)

    // show or hide after load
    document.querySelector(".btn-container").style.display = "flex"
    document.querySelector("#loading").style.display = "none"
    canvas.style.display = "block"
    if (!isMobile) {
        document.querySelector(".card-wrapper").style.display = "block"
    }

    // list of particles
    const particles = [
        "src/particles/particles.json",
        "src/particles/particles-bubble.json",
        "src/particles/particles-nasa.json",
        "src/particles/particles-snow.json",
    ]

    if (!isMobile) {
        // load particles
        particlesJS.load("particles-js", getRandom(particles), function () {
            console.log("particles.js loaded - callback")
        })
    }

    // background fill color
    const backgroundColor = "#2e2e2e"
    // top circle initial position
    const positionY = 60
    // scale between category
    const scale = 1.3
    // initial radius of first circle
    const initialValue = 20
    // walls fill color
    const wallsColor = "#1c1c1c"
    // sign fill color
    const signColor = "#986129"
    // walls wallThickness
    const wallThickness = 20
    // floor thickness
    const floorThickness = 100
    // radius of texture image = image size/2
    const textureImageRadius = 75
    // texture images count
    const textureImageCount = 39
    // all possible texture images
    const textures = []
    for (let i = 1; i <= textureImageCount; i++) {
        textures.push(`assets/image/circles/orbs (${i}).png`)
    }
    // shuffle array value to get random image
    textures.sort(() => Math.random() - 0.5)

    // list of sfx
    const sfx = {
        merge: new Howl({
            src: ["assets/audio/merge.wav"],
        }),
        gameOver: new Howl({
            src: ["assets/audio/game_over.mp3"],
        }),
        hit: new Howl({
            src: ["assets/audio/hit.wav"],
        }),
    }

    // list of BGM
    const music = {
        bgm: new Howl({
            src: ["assets/audio/bgm/enjoy.mp3"],
            loop: true,
        }),
    }

    music.bgm.play()

    const btnPlay = document.querySelector("#btn-music-play")
    const btnStop = document.querySelector("#btn-music-stop")

    btnPlay.style.display = "none"
    btnStop.style.display = "block"

    // function to play BGM
    function playMusic() {
        if (!music.bgm.playing()) {
            btnPlay.style.display = "none"
            btnStop.style.display = "block"
            music.bgm.play()
        }
    }

    // function to stop BGM
    function stopMusic() {
        if (music.bgm.playing()) {
            btnPlay.style.display = "block"
            btnStop.style.display = "none"
            music.bgm.stop()
        }
    }

    btnPlay.onclick = () => {
        playMusic()
    }
    btnStop.onclick = () => {
        stopMusic()
    }

    // create an engine
    const engine = Engine.create()
    const world = engine.world

    // custom property
    let gameOver = false
    let gameScore = 0

    // create a renderer
    const render = Render.create({
        canvas: canvas,
        engine: engine,
        options: {
            width: CW,
            height: CH,
            background: backgroundColor,
            wireframes: false,
            showCollisions: false,
            showDebug: false,
            showPositions: false,
        },
    })
    // canvas 2D context
    const ctx = render.context
    // run the renderer
    Render.run(render)
    // create runner
    const runner = Runner.create()
    // run the engine
    Runner.run(runner, engine)
    // add mouse control
    const mouse = Mouse.create(render.canvas),
        mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false,
                },
            },
        })
    // add mouse to world
    Composite.add(world, mouseConstraint)
    // keep the mouse in sync with rendering
    render.mouse = mouse
    // fit the render viewport to the scene
    Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: CW, y: CH },
    })

    // define our categories (as bit fields, there are up to 32 available) to prevent mouse for moving the circle
    const defaultCategory = 0x0001,
        redCategory = 0x0002,
        greenCategory = 0x0004

    // only green category should be draggable with the mouse
    mouseConstraint.collisionFilter.mask = greenCategory

    // radius ratio between category
    const commonRatio = scale // 7.5 / 5 = 1.5

    // categories count
    const numTerms = textures.length

    // create all possible radius sizes for the circle
    const sizes = generateGeometricSequence(initialValue, commonRatio, numTerms)

    // Array to store all possible circle category
    const categories = []
    // generate all possible category for the circle
    for (let i = 0; i < textures.length; i++) {
        categories.push({
            size: sizes[i],
            category: i,
            texture: textures[i],
            textureScale: sizes[i] / textureImageRadius,
        })
    }

    // create first circle and add to world
    createCircle()

    let allowNextCircle = true
    const timeToNextCircle = 1100

    // get start canvas position
    const startCanvasPosition = window.innerWidth / 2 - CW / 2
    // get end canvas position
    const endCanvasPosition = startCanvasPosition + CW

    // set circle position back to center when mouse outside the canvas
    window.addEventListener("mousemove", (e) => {
        if (!allowNextCircle) return

        // get all circle body
        const circles = getBodies()

        const mouseX = e.x
        const mouseY = e.y

        // check if mouse position is out of canvas
        if (mouseX < startCanvasPosition || mouseX > endCanvasPosition || mouseY < 0 || mouseY > CH) {
            // update latest circle position here
            Body.setPosition(circles[circles.length - 1], {
                x: CW / 2,
                y: positionY,
            })
        }
    })

    // listen to mouse movement and update static circle position
    Events.on(mouseConstraint, "mousemove", (event) => {
        if (!allowNextCircle) return
        // get all circle body
        const circles = getBodies()

        const mouseX = event.mouse.position.x
        const mouseY = event.mouse.position.y
        // console.log(mouseX, mouseY)
        // check if mouse position is out of canvas
        if (mouseX < startCanvasPosition || mouseX > endCanvasPosition || mouseY < 0 || mouseY > CH) {
            // update latest circle position here
            Body.setPosition(circles[circles.length - 1], {
                x: CW / 2,
                y: positionY,
            })
        }

        // update latest circle position here
        Body.setPosition(circles[circles.length - 1], {
            x: mouseX,
            y: positionY,
        })
    })

    // listen to mouse left click and set circle static to false
    Events.on(mouseConstraint, "mouseup", (event) => {
        if (allowNextCircle) {
            allowNextCircle = false
            // get all circle body
            const circles = getBodies()
            // set latest circle isStatic to false here
            Body.setStatic(circles[circles.length - 1], false)
            // create next circle

            // set timer to create next circle
            setTimeout(() => {
                allowNextCircle = true
                createCircle()
            }, timeToNextCircle)
        }
    })
    // handle collision between circle and floor
    Events.on(engine, "collisionStart", (event) => {
        const pairs = event.pairs

        for (let i = 0; i < pairs.length; i++) {
            const bodyA = pairs[i].bodyA
            const bodyB = pairs[i].bodyB
            if ((bodyA.label === "Circle Body" && bodyB.label === "Floor") || (bodyB.label === "Circle Body" && bodyA.label === "Floor")) {
                sfx.hit.play()
            }
        }
    })

    // handle collision between two circle
    Events.on(engine, "collisionActive", (event) => {
        // pairs of active collision between two circle => []
        const pairs = event.source.pairs.list

        // check collision between circles
        for (let i = 0; i < pairs.length; i++) {
            // get collided circle
            const circleA = pairs[i].bodyA
            const circleB = pairs[i].bodyB

            // filter collided circle
            if (checkCircleCollision(circleA, circleB)) {
                // play collision audio
                sfx.merge.play()
                console.log(currentUser)
                // remove circleA in world
                Composite.remove(world, circleA)

                // category is a number and it has 0 on it so we add 1 to prevent adding 0 value to gameScore
                gameScore += circleB.category + 1

                // update circleB
                // check previous circleB category
                const prevCategory = circleB.category
                // update circleB category
                const newCategory = prevCategory < textures.length ? categories[prevCategory + 1] : prevCategory
                // update depends on previous circleB category
                Body.set(circleB, "category", newCategory.category)
                // update body texture
                Body.set(circleB.render.sprite, "texture", newCategory.texture)
                // update body texture scale X
                Body.set(circleB.render.sprite, "xScale", newCategory.textureScale)
                // update body texture scale Y
                Body.set(circleB.render.sprite, "yScale", newCategory.textureScale)
                // update circleB radius
                Body.scale(circleB, scale, scale)
            }
        }
    })

    // an example of using beforeUpdate event on an engine
    Events.on(engine, "beforeUpdate", function (event) {
        // draw game score
        drawGameStatus()
        // get all bodies in world
        const circles = getBodies()
        // game over condition
        for (let i = 0; i < circles.length; i++) {
            // check circle highest y coordinate
            const y = circles[i].position.y - circles[i].circleRadius
            if (y <= 10 && !circles[i].isStatic) {
                // stop bgm if playing
                if (music.bgm.playing()) {
                    music.bgm.stop()
                }
                // play game over audio
                if (!sfx.gameOver.playing()) {
                    sfx.gameOver.play()
                }
                gameOver = true
                // stop world for re render
                Composite.clear(world, true)
                Render.stop(render)
            }
        }
    })

    // create walls
    const wallOptions = {
        isStatic: true,
        label: "Wall",
        render: {
            fillStyle: wallsColor,
        },
    }
    const topWall = Bodies.rectangle(CW / 2, 0, CW, wallThickness, wallOptions)
    const bottomWall = Bodies.rectangle(CW / 2, CH, CW, floorThickness, {
        isStatic: true,
        label: "Floor",
        render: {
            fillStyle: wallsColor,
        },
    })
    const leftWall = Bodies.rectangle(0, CH / 2, wallThickness, CH, wallOptions)
    const rightWall = Bodies.rectangle(CW, CH / 2, wallThickness, CH, wallOptions)
    Composite.add(world, [topWall, rightWall, leftWall, bottomWall])

    // create hanging sign
    const sign = Bodies.rectangle(50, 50, 100, 30, {
        label: "Sign",
        render: {
            fillStyle: signColor,
        },
        chamfer: {
            radius: 3,
        },
    })
    const constraintRender = {
        strokeStyle: "#9b9b9b",
        lineWidth: 1.5,
    }
    const constraintLength = 10
    const constraintLeft = Constraint.create({
        bodyA: topWall,
        pointA: { x: 30 - CW / 2, y: wallThickness / 2 },
        bodyB: sign,
        pointB: { x: -40, y: -15 },
        render: constraintRender,
        length: constraintLength,
    })
    const constraintRight = Constraint.create({
        bodyA: topWall,
        pointA: { x: 110 - CW / 2, y: wallThickness / 2 },
        bodyB: sign,
        pointB: { x: 40, y: -15 },
        render: constraintRender,
        length: constraintLength,
    })

    if (isMobile) {
        Composite.add(world, [constraintLeft, constraintRight, sign])
    }

    /** UTILS **/
    /**
     * Draw game status on canvas
     */
    function drawGameStatus() {
        if (gameOver) {
            // draw game over message
            ctx.save()
            const fromX = CW / 2 - 145
            ctx.font = "bold 50px Arial"
            ctx.fillStyle = "#191919"
            ctx.fillText(`GAME OVER`, fromX + 3, CH / 2 + 3)
            ctx.fillStyle = "#f4f4f4"
            ctx.fillText(`GAME OVER`, fromX, CH / 2)
            ctx.restore()
        } else {
            // update score ui
            // get sign body
            if (isMobile) {
                const signBody = Composite.allBodies(world).filter((body) => body.label === "Sign")[0]
                const signX = signBody.position.x
                const signY = signBody.position.y

                ctx.save()
                // draw game score
                ctx.translate(signX, signY)
                ctx.rotate(signBody.angle)
                ctx.font = "bold 15px Arial"
                ctx.fillStyle = "#070707"
                ctx.fillText(`SCORE: ${gameScore.toString()}`, -38, 7)
                ctx.fillStyle = "#e9e9e9"
                ctx.fillText(`SCORE: ${gameScore.toString()}`, -40, 5)
                ctx.restore()
            }
        }
    }

    /**
     * Get random value from Array
     * @return Array[random]
     */
    function getRandom(array) {
        const randomIndex = Math.floor(Math.random() * array.length)
        return array[randomIndex]
    }

    function generateGeometricSequence(initialValue, commonRatio, numTerms) {
        const sequence = []
        let currentValue = initialValue

        for (let i = 0; i < numTerms; i++) {
            sequence.push(currentValue)
            currentValue *= commonRatio
        }

        return sequence
    }

    /**
     * Get all circle body from world
     * @return Body[]
     */
    function getBodies() {
        return Composite.allBodies(world).filter((body) => body.label === "Circle Body")
    }

    /**
     * create and add new circle to world
     * @return Void
     */
    function createCircle() {
        const category = getRandom([...categories.slice(0, 4)])
        const options = {
            isStatic: true,
            restitution: 0.5, // bounce level
            category: category.category,
            collisionFilter: {
                mask: defaultCategory | redCategory,
            },
            render: {
                sprite: {
                    texture: category.texture,
                    xScale: category.textureScale,
                    yScale: category.textureScale,
                },
            },
        }
        const circle = Bodies.circle(CW / 2, positionY, category.size, options)
        Composite.add(world, circle)
    }

    /**
     * Check collision between two circle
     * @return Boolean
     */
    function checkCircleCollision(circleA, circleB) {
        return (
            circleA.category === circleB.category &&
            circleA.circleRadius === circleB.circleRadius &&
            circleA.label === "Circle Body" &&
            circleB.label === "Circle Body" &&
            !circleA.isStatic &&
            !circleB.isStatic
        )
    }
})
