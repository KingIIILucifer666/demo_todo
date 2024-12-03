"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
// import { nhost } from "@/lib/nhost";
import { useNhostClient } from "@nhost/nextjs";
import toast from "react-hot-toast";

const getUserTodos = (userId) => `
    query  MyQuery{
      todos(where: { user_id: { _eq: "${userId}" } }) {
        id
        title
        completed
        created_at
        updated_at
      }
    }
  `;

const updateTodo = `
      mutation($id: uuid!) {
        update_todos_by_pk(pk_columns: {id: $id}, _set: {completed: true}) {
          completed
        }
      }
    `;

const deleteTodo = `
    mutation($id: uuid!) {
      delete_todos_by_pk(id: $id) {
        id
      }
    }
  `;

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [fetchAll, setFetchAll] = useState(false);

  const [session, setSession] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [todos, setTodos] = useState([]);
  const [userId, setUserId] = useState("");

  const nhostClient = useNhostClient();

  useEffect(() => {
    setSession(nhostClient.auth.getSession());

    nhostClient.auth.onAuthStateChanged((_, session) => {
      setSession(session);
      if (session) {
        setUserId(session.user?.id);
        setAccessToken(session.accessToken);
      }
    });
  }, []);

  useEffect(() => {
    if (accessToken) {
      nhostClient.graphql.setAccessToken(accessToken);
      nhostClient.storage.setAccessToken(accessToken);
    }
  }, [accessToken]);

  useEffect(() => {
    const fetchUserTodos = async () => {
      if (!session) return;

      setLoading(true);

      const { data, error } = await nhostClient.graphql.request(
        getUserTodos(userId)
      );

      if (error) {
        console.error("Error fetching todos:", error);
        setTodos([]);
      } else {
        setTodos(data?.todos || []);
      }
      setLoading(false);
    };

    if (userId) {
      fetchUserTodos();
    }
    return () => {
      setFetchAll(false);
    };
  }, [session, fetchAll, userId]);

  const handleUpdateTodo = async (id) => {
    const { error } = await nhostClient.graphql.request(updateTodo, { id });

    if (error) {
      console.error({ error });
      return;
    }

    toast.success("Marked as complete");

    setFetchAll(true);
  };

  const handleDeleteTodo = async (id) => {
    if (!window.confirm("Are you sure you want to delete this TODO?")) {
      return;
    }

    const { error } = await nhostClient.graphql.request(deleteTodo, { id });
    if (error) {
      console.error({ error });
    }

    toast.success("Todo Deleted");

    setFetchAll(true);
  };

  // console.log("User ID: ", userId);
  // console.log("Access Token: ", accessToken);
  // console.log("Session Data: ", session);

  return (
    <div className="bg-zinc-800 h-screen w-full justify-between">
      <div className="w-full bg-black/20 px-28 py-5 inline-flex justify-center items-center gap-5">
        {session ? (
          <div className="w-full inline-flex justify-between">
            <Link
              href={{
                pathname: "/insert-todo",
                query: {
                  id: userId,
                  // accessToken: accessToken,
                },
              }}
              className="w-1/4"
            >
              INSERT TODOS
            </Link>

            <div className="w-2/4 text-center">
              <span>Welcome, {session.user?.email}</span>
            </div>
            <button
              className="w-1/4"
              onClick={async () => {
                try {
                  await nhostClient.auth.signOut();
                  console.log("signout successful");
                } catch (error) {
                  console.error("Error Logging out");
                }
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <Link href="/signin">Sign In</Link>
            <Link href="/register">Register</Link>
          </>
        )}
      </div>
      <div className="h-full flex justify-center items-start mt-20">
        <div>
          {session ? (
            <div>
              <div className="flex flex-col justify-center items-center p-10">
                ALL TODOS
              </div>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <div className="bg-zinc-500 w-full h-full flex justify-center rounded-xl md:p-6 p-4 overflow-y-auto no-scrollbar">
                  <table className="border-collapse w-full text-left text-xs bg-zinc-700 text-white rounded-lg shadow-lg">
                    <thead>
                      <tr className="uppercase border-b border-gray-600">
                        <th className="py-3 px-4 font-medium">ID</th>
                        <th className="py-3 px-4 font-medium">TITLE</th>
                        <th className="py-3 px-4 font-medium">COMPLETED</th>
                        <th className="py-3 px-4 font-medium">CREATED AT</th>
                        <th className="py-3 px-4 font-medium">UPDATED AT</th>
                        <th className="py-3 px-4 font-medium">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todos.map((todo, index) => (
                        <tr key={index}>
                          <td className="py-3 px-4">{todo.id}</td>
                          <td className="py-3 px-4">{todo.title}</td>
                          <td className="py-3 px-4 inline-flex justify-center items-center gap-2">
                            <div
                              className={` h-2 w-2 rounded-full ${
                                todo.completed ? "bg-green-600" : "bg-red-600"
                              }`}
                            ></div>
                            <button
                              type="button"
                              onClick={() => handleUpdateTodo(todo.id)}
                            >
                              Toggle
                            </button>
                          </td>
                          <td className="py-3 px-4">{todo.created_at}</td>
                          <td className="py-3 px-4">{todo.updated_at}</td>
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() => handleDeleteTodo(todo.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
}
