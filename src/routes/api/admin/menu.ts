import { Router } from "express"
import { Perms, adminPerm, project } from "@/utility"
import multer from "multer"
import * as XLSX from "xlsx"
import Menu from "@schemas/Menu"
import Vote from "@schemas/Vote"
import capability, { Features } from "@/capability"
import { editorRouter } from "./editor"
import usettings from "@/usettings"

const menuRouter = Router()

const storage = multer.memoryStorage()
const upload = multer({storage: storage})

interface sheetObject {
    day: string;
    sn: string;
    sn2: string;
    ob: string;
    kol: string;
}

menuRouter.use(adminPerm(Perms.Menu))
menuRouter.use(capability.mw(Features.Menu))

menuRouter.get('/', async (req, res) => {
    if (req.query.start && req.query.end) {
        const start = new Date(req.query.start.toString())
        const end = new Date(req.query.end.toString())
        res.send(await Menu.find({day: {$gte: start, $lte: end}}, undefined, {sort: {day: 1}}))
    } else {
        res.status(400).end()
    }
})

function dayName(date: Date) {
    switch (date.getDay()) {
        case 0:
            return "Niedziela"
        case 1:
            return "Poniedziałek"
        case 2:
            return "Wtorek"
        case 3:
            return "Środa"
        case 4:
            return "Czwartek"
        case 5:
            return "Piątek"
        case 6:
            return "Sobota"
        default:
            break;
    }
}

menuRouter.get('/print', async (req, res) => {
    if (req.query.start && req.query.end) {
        const start = new Date(req.query.start.toString())
        const end = new Date(req.query.end.toString())
        var meals = await Menu.find({day: {$gte: start, $lte: end}}, undefined, {sort: {day: 1}})
        var doc = meals.map(s => `<tr>
    <th>${dayName(s.day)}<br>${s.day.getDate()}.${s.day.getMonth()}.${s.day.getFullYear()}r.<br>${s.dayTitle}</th>
    <td>${usettings.settings.menu.defaultItems.sn.join('<br>')}<br>${s.sn.fancy.join('<br>')}<br>${s.sn.second}</td>
    <td>
        <b>Z:</b> ${s.ob.soup}<br>
        <b>V:</b> ${s.ob.vege}<br>
        ${s.ob.meal}<br>
        ${s.ob.condiments.length != 0 ? s.ob.condiments.join('<br>') + "<br>" : ""}
        ${s.ob.drink}<br>
        ${s.ob.other.join('<br>')}
    </td>
    <td>${s.day.getUTCDay() == 5 ? "<b>Kolacja w domu!</b>" : `${usettings.settings.menu.defaultItems.kol.join('<br>')}<br>${s.kol}`}</td>
</tr>`)
        var html = `<html><head><meta charset="UTF-8"><style>table,th,td{border: 0.4ch solid;}td{line-height: 1.5;}</style></head><body><table><caption>Jadłospis dekadowy</caption><thead><tr><th>Dzień</th><th>Śniadanie</th><th>Obiad</th><th>Kolacja</th></tr></thead><tbody>${doc.join('\n')}</tbody></table></body></html>`
        res.type('html').send(html)
    } else {
        res.status(400).end()
    }
})

menuRouter.get('/opts', async (req, res) => {
    var all = await Menu.find()
    var g = {
        sn: {
            fancy: Array.from(new Set(all.flatMap(v => v.sn.fancy).filter(v => v != ""))),
            second: Array.from(new Set(all.map(v => v.sn.second).filter(v => v != "")))
        },
        ob: {
            soup: Array.from(new Set(all.map(v => v.ob.soup).filter(v => v != ""))),
            vege: Array.from(new Set(all.map(v => v.ob.vege).filter(v => v != ""))),
            meal: Array.from(new Set(all.map(v => v.ob.meal).filter(v => v != ""))),
            condiments: Array.from(new Set(all.flatMap(v => v.ob.condiments).filter(v => v != ""))),
            drink: Array.from(new Set(all.map(v => v.ob.drink).filter(v => v != ""))),
            other: Array.from(new Set(all.flatMap(v => v.ob.other).filter(v => v != "")))
        },
        kol: Array.from(new Set(all.map(v => v.kol).filter(v => v != "")))
    }
    res.send(g)
})

menuRouter.post('/:date', async (req, res) => {
    if (await Menu.create({day: new Date(req.params.date)})) {
        res.status(201).send({status: 201})
    } else {
        res.sendStatus(500);
    }
    
})

menuRouter.post('/:start/:count', async (req, res) => {
    var dates: any[] = []
    for (let i = 0; i < Number(req.params.count); i++) {
        var date = new Date(req.params.start)
        dates.push({day: date.setDate(date.getDate() + i)})
    }
    if (await Menu.create(dates)) {
        res.status(201).send({status: 201})
    } else {
        res.sendStatus(500);
    }
})

menuRouter.post('/upload', upload.single('menu'), async (req,res)=> {
    if (!req.file) {
        res.status(400).send("File required")
        return
    }
    var sheet = XLSX.read(req.file.buffer)
    var data: sheetObject[] = XLSX.utils.sheet_to_json(sheet.Sheets[sheet.SheetNames[0]], {raw: true, header: ["day", "sn", "sn2", "ob", "kol"], range: 2})
    data = data.map((val, i) => {
        var result: any = {}
        var dateparts = val.day.match(/(\d{2})\.(\d{2})\.(\d{4})/)
        if (dateparts) {
            var date = new Date(parseInt(dateparts[3]),parseInt(dateparts[2])-1,parseInt(dateparts[1]))
            date.setUTCHours(0,0,0,0)
        } else {
            res.sendStatus(500)
            return
        }
        result.day = date
        result.sn = val.sn.split('\n')
        result.sn.push(val.sn2)

        //#region ob
        var ob = val.ob
        ob = ob.replace(/^\s*\n/gm, "")
        ob = ob.replace(/ \/ /gm, "\n")
        ob = ob.replace(/:(?!\s)/gm, ": ")
        result.ob = ob.split('\n')
        //#endregion

        result.kol = val.kol
        if (date.getUTCDay() == 5) {
            result.kol = null
        }
        return result
    })
    
    if (await Menu.insertMany(data)) {
        res.status(201).send({status: 201})
    } else {
        res.sendStatus(500)
    }
})

menuRouter.put('/:id', async (req, res) => {
    let menu = await Menu.findById(req.params.id)
    if (!menu) {
        res.status(404).send("Menu not found")
        return
    }
    let projField = project(req.body, Menu.schema.obj)
    if (projField) {
        try {
            await menu.set(projField).save()
            res.send({status: 200}).end()
        } catch (error) {
            res.status(500).send(error)
        }
    } else {
        res.status(400).send("No valid fields set")
        return
    }
})

menuRouter.get('/:id/votes/:m', async (req, res) => {
    let votes = await Vote.find({dom: new Date(req.params.id)})
    if (!votes) {
        res.end()
        return
    }
    var fvotes = votes.filter(i => i.tom == req.params.m)
    var ycount = fvotes.filter(i => i.vote == "+").length
    var ncount = fvotes.filter(i => i.vote == "-").length
    res.send({
        y: ycount,
        n: ncount,
    })
})

menuRouter.delete('/:id', async (req, res) => {
    if (await Menu.findByIdAndDelete(req.params.id)) {
        res.send({status: 200}).end()
    } else {
        res.sendStatus(404)
    }
})

menuRouter.use('/editor', editorRouter)

export {menuRouter};