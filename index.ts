import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

// Importando Prisma Client
import { PrismaClient } from "@prisma/client";

dotenv.config();
//Inicia el cliente
const prisma = new PrismaClient();
const app: Express = express();
const port: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());
//GET AUTHORS
app.get("/authors", async (req: Request, res: Response) => {
  const authors = await prisma.user.findMany();
  return res.json(authors);
});

//GET ONE AUTHOR
app.get("/author/:idUser", async (req: Request, res: Response) => {
  const idUser = Number(req.params.idUser);
  const getAuthor = await prisma.user.findUnique({
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
});
//CREATE AUTHOR
app.post("/author", async (req: Request, res: Response) => {
  const { name, email } = req.body;
  const user = await prisma.user.create({
    data: {
      name,
      email,
      posts: {
        create: [{title:"Posteo desde autor varios 1",content:"Contenido 1"},{title:"Posteo desde autor varios 2",content:"Contenido 2"}]
      }
    },
  });
  return res.status(201).json(user);
});
//UPDATE AUTHOR
app.put("/author/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const data = req.body;
  const updateAuthor = await prisma.user.update({
    where: { id },
    data,
  })
  return res.json(updateAuthor);
});
//DELETE AUTHOR (Borra la relación entre author y post pero no borra posts, hacer modificacion en el schema.prisma)
app.delete("/author/:id", async (req, res) => {
  const id = Number(req.params.id);
  const user = await prisma.user.delete({
      where: { id }
  });
  return res.status(204).json({"mensaje":"Eliminado"});
});

//DELETE AUTHOR CON SUS POSTS
app.delete("/authorposts/:idUser", async (req, res) => {
  const id = Number(req.params.idUser);
  const deletePosts = prisma.post.deleteMany({
    where: {
      authorId: id,
    },
  })
  
  const deleteUser = prisma.user.delete({
    where: {
      id,
    },
  })
  
  const transaction = await prisma.$transaction([deletePosts, deleteUser])
  return res.status(204).json(transaction);
});

//GET POSTS
app.get("/posts", async (req: Request, res: Response) => {
  const posts = await prisma.post.findMany();
  return res.json(posts);
});

//GET ONE POST
app.get("/post/:idPost", async (req: Request, res: Response) => {
  const idPost = Number(req.params.idPost);
  const getPost = await prisma.post.findUnique({
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
});


//CREAR POSTS
app.post("/post", async (req: Request, res: Response) => {
  const { title, content, author } = req.body;
  const result = await prisma.post.create({
    data: {
      title,
      content,
      author: { connect: { id: author } },
    },
  });
  res.json(result);
});

//UPDATE POSTS
app.put("/post/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const data = req.body;
  const updatePost = await prisma.post.update({
    where: { id },
    data,
  })
  return res.json(updatePost);
});
//DELETE POSTS
app.delete("/post/:id", async (req, res) => {
  const id = Number(req.params.id);
  const post = await prisma.post.delete({
      where: { id }
  });
  return res.json({"mensaje":"Eliminado"});
});

//Mensaje de inicio
app.listen(port, () => {
  console.log(`El servidor se ejecuta en http://localhost:${port}`);
});

// Export the Express API
module.exports = app;