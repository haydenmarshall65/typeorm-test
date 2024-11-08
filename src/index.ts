import * as express from "express"
import * as bodyParser from "body-parser"
import { Request, Response } from "express"
import { AppDataSource } from "./data-source"
import { Routes } from "./routes"
import { User } from "./entity/User"

AppDataSource.initialize().then(async () => {

    // create express app
    const app = express()
    app.use(bodyParser.json())

    // register express routes from defined application routes
    Routes.forEach(route => {
        (app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
            const result = (new (route.controller as any))[route.action](req, res, next)
            if (result instanceof Promise) {
                result.then(result => result !== null && result !== undefined ? res.send(result) : undefined)

            } else if (result !== null && result !== undefined) {
                res.json(result)
            }
        })
    })

    // setup express app here
    // ...

    // start express server
    app.listen(3000)

    const users = await AppDataSource.manager.find(User)

    if(Array.isArray(users) && users.length === 0){
        // insert new users if nothing created yet
        await AppDataSource.manager.save(
            AppDataSource.manager.create(User, {
                name: "big dog",
                email: "bigdog@testing.com",
                username: "bigdogtesting",
                phone_number: "1234567890"
            })
        )

        await AppDataSource.manager.save(
            AppDataSource.manager.create(User, {
                name: "kitty cat",
                email: "kittcat@testing.com",
                username: "kittycattesting",
                phone_number: "0123456789"
            })
        )
    }


    console.log("Express server has started on port 3000. Open http://localhost:3000/users to see results")

}).catch(error => console.log(error))
