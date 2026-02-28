"use client";

export default function Feed() {

  function publicarPost() {
    alert("Post publicado!");
  }

  return (
    <main className="min-h-screen bg-gray-100 flex justify-center pt-10">

      <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-xl">

        <h1 className="text-lg font-semibold mb-3">
          Criar publicação
        </h1>

        <textarea
          id="postInput"
          rows="3"
          className="w-full border rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="No que você está pensando?"
        />

        <button
          onClick={publicarPost}
          className="mt-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg w-full"
        >
          Publicar
        </button>

      </div>

    </main>
  );

}
