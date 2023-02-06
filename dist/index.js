"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
// Importando Prisma Client
const client_1 = require("@prisma/client");
dotenv_1.default.config();
//Inicia el cliente
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
app.use(express_1.default.json());
//GET AUTHORS
app.get("/authors", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authors = yield prisma.user.findMany();
    return res.json(authors);
}));
//GET ONE AUTHOR
app.get("/author/:idUser", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const idUser = Number(req.params.idUser);
    const getAuthor = yield prisma.user.findUnique({
        where: {
            id: idUser,
        },
        include: {
            posts: {
                select: {
                    title: true,
                },
            },
        },
    });
    return res.json(getAuthor);
}));
//CREATE AUTHOR
app.post("/author", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email } = req.body;
    const user = yield prisma.user.create({
        data: {
            name,
            email,
            posts: {
                create: [{ title: "Posteo desde autor varios 1", content: "Contenido 1" }, { title: "Posteo desde autor varios 2", content: "Contenido 2" }]
            }
        },
    });
    return res.status(201).json(user);
}));
//UPDATE AUTHOR
app.put("/author/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    const data = req.body;
    const updateAuthor = yield prisma.user.update({
        where: { id },
        data,
    });
    return res.json(updateAuthor);
}));
//DELETE AUTHOR (Borra la relación entre author y post pero no borra posts, hacer modificacion en el schema.prisma)
app.delete("/author/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    const user = yield prisma.user.delete({
        where: { id }
    });
    return res.status(204).json({ "mensaje": "Eliminado" });
}));
//DELETE AUTHOR CON SUS POSTS
app.delete("/authorposts/:idUser", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.idUser);
    const deletePosts = prisma.post.deleteMany({
        where: {
            authorId: id,
        },
    });
    const deleteUser = prisma.user.delete({
        where: {
            id,
        },
    });
    const transaction = yield prisma.$transaction([deletePosts, deleteUser]);
    return res.status(204).json(transaction);
}));
//GET POSTS
app.get("/posts", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield prisma.post.findMany();
    return res.json(posts);
}));
//GET ONE POST
app.get("/post/:idPost", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const idPost = Number(req.params.idPost);
    const getPost = yield prisma.post.findUnique({
        where: {
            id: idPost,
        },
        include: {
            author: {
                select: {
                    email: true,
                },
            },
        },
    });
    return res.json(getPost);
}));
//CREAR POSTS
app.post("/post", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, content, author } = req.body;
    const result = yield prisma.post.create({
        data: {
            title,
            content,
            author: { connect: { id: author } },
        },
    });
    res.json(result);
}));
//UPDATE POSTS
app.put("/post/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    const data = req.body;
    const updatePost = yield prisma.post.update({
        where: { id },
        data,
    });
    return res.json(updatePost);
}));
//DELETE POSTS
app.delete("/post/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    const post = yield prisma.post.delete({
        where: { id }
    });
    return res.json({ "mensaje": "Eliminado" });
}));
//Mensaje de inicio
app.listen(port, () => {
    console.log(`El servidor se ejecuta en http://localhost:${port}`);
});
// Export the Express API
module.exports = app;
//# sourceMappingURL=index.js.map