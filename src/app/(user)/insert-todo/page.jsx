"use client";
import React, { useState } from "react";
import { useFileUpload, useNhostClient } from "@nhost/nextjs";
import { useRouter, useSearchParams } from "next/navigation";

const insertTodos = (title, userId) => {
  `
    mutation MyMutation {
  insert_todos(
    objects: {
      completed: false,
      title: ${title},
      user_id: ${userId}
    }
  ) {
    returning {
      id
      title
      completed
      user_id
      created_at
      updated_at
      file_id
    }
  }
}`;
};

const insertOneTodo = (title, user_id) => {
  `
mutation MyMutation {
      insert_todos_one(object: {title: ${title}, user_id :${user_id}}) {
        id
      }
    }`;
};

const createTodo = `
    mutation MyMutation($title: String!, $file_id: uuid, $user_id: uuid!) {
      insert_todos_one(object: {title: $title, file_id: $file_id, user_id: $user_id}) {
        id
      }
    }
  `;

const Todo = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [todoTitle, setTodoTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [todoAttachment, setTodoAttachment] = useState(null);

  const NhostClient = useNhostClient();
  const { upload } = useFileUpload();

  const handleCreateTodo = async (e) => {
    e.preventDefault();

    let todo = { title: todoTitle, user_id: id };
    if (todoAttachment) {
      const { id, error } = await upload({
        file: todoAttachment,
        name: todoAttachment.name,
      });

      if (error) {
        console.error({ error });
        return;
      }

      todo.file_id = id;
    }

    const { error } = await NhostClient.graphql.request(createTodo, todo);

    if (error) {
      setErrorMessage(error.message);
      console.error({ error });
      return;
    }

    console.log("New Todo Added");

    setTodoTitle("");
    setTodoAttachment(null);
    router.push("/");
  };

  // console.log("User Id: ", id);
  // console.log("Access Token: ", accessToken);

  return (
    <div className="bg-zinc-800 flex flex-col justify-start items-center min-h-screen w-full px-10 p-20">
      <p>CREATE NEW TODO</p>
      <div>
        <div className="mt-10">
          <div className="form-section">
            <form onSubmit={handleCreateTodo}>
              <div className="input-group">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  type="text"
                  placeholder="Title"
                  value={todoTitle}
                  onChange={(e) => setTodoTitle(e.target.value)}
                  className="text-white bg-gray-500"
                />
              </div>
              <div className="input-group">
                <label htmlFor="file">File (optional)</label>
                <input
                  id="file"
                  type="file"
                  onChange={(e) => setTodoAttachment(e.target.files[0])}
                />
              </div>
              <div>
                <button disabled={loading} className="p-4 bg-zinc-800">
                  {loading ? <span>Loading...</span> : <span>Create</span>}
                </button>
              </div>
            </form>
            {errorMessage && <p>{errorMessage.message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Todo;
