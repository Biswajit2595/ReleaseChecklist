"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL;

type Release = {
  id: number;
  name: string;
  releaseDate: string;
  additionalInfo: string;
  stepsCompleted: Record<string, boolean>;
  status: "planned" | "ongoing" | "done";
};

const STEPS = [
  "All relevant GitHub pull requests have been merged",
  "CHANGELOG.md files have been updated",
  "All tests are passing",
  "Releases in Github created",
  "Deployed in demo",
  "Tested thoroughly in demo",
  "Deployed in production",
];

export default function Home() {
  const [view, setView] = useState<"list" | "detail">("list");
  const [releases, setReleases] = useState<Release[]>([]);
  const [selected, setSelected] = useState<Release | null>(null);

  const [form, setForm] = useState({
    name: "",
    releaseDate: "",
    additionalInfo: "",
  });

  const fetchReleases = async () => {
    const res = await axios.get(`${API}/api/releases`);
    setReleases(res.data);
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  const createRelease = async () => {
    if (!form.name || !form.releaseDate) return;

    await axios.post(`${API}/api/releases`, form);

    setForm({
      name: "",
      releaseDate: "",
      additionalInfo: "",
    });

    fetchReleases();
  };

  const openRelease = (item: Release) => {
    setSelected(item);
    setView("detail");
  };

  const toggleStep = async (stepName: string) => {
    if (!selected) return;

    const res = await axios.patch(
      `${API}/api/releases/${selected.id}/steps`,
      { stepName }
    );

    setSelected(res.data);
    fetchReleases();
  };

  const saveInfo = async () => {
    if (!selected) return;

    await axios.patch(
      `${API}/api/releases/${selected.id}/info`,
      {
        additionalInfo: selected.additionalInfo,
      }
    );

    fetchReleases();
    setView("list");
  };

  const deleteRelease = async (id: number) => {
    await axios.delete(`${API}/api/releases/${id}`);
    fetchReleases();

    if (selected?.id === id) {
      setSelected(null);
      setView("list");
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "done") return "text-green-600";
    if (status === "ongoing") return "text-yellow-600";
    return "text-gray-500";
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded border shadow">
        <div className="h-8 bg-slate-300 rounded-t" />

        <div className="p-10">
          <h1 className="text-4xl font-bold text-center">
            ReleaseCheck
          </h1>

          <p className="text-center text-gray-500 mt-2">
            Your all-in-one release checklist tool
          </p>

          {/* LIST VIEW */}
          {view === "list" && (
            <div className="mt-10 border rounded">
              <div className="flex justify-between items-center p-4 border-b">
                <span className="text-indigo-500 text-sm">
                  All releases
                </span>

                <button
                  onClick={createRelease}
                  className="bg-indigo-600 text-white px-4 py-2 rounded text-sm"
                >
                  New release
                </button>
              </div>

              {/* Create Form */}
              <div className="grid md:grid-cols-3 gap-3 p-4 border-b">
                <input
                  className="border rounded p-2"
                  placeholder="Release Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                />

                <input
                  type="datetime-local"
                  className="border rounded p-2"
                  value={form.releaseDate}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      releaseDate: e.target.value,
                    })
                  }
                />

                <input
                  className="border rounded p-2"
                  placeholder="Additional Info"
                  value={form.additionalInfo}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      additionalInfo:
                        e.target.value,
                    })
                  }
                />
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b text-left">
                    <th className="p-3">Release</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">View</th>
                    <th className="p-3">Delete</th>
                  </tr>
                </thead>

                <tbody>
                  {releases.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-3">
                        {item.name}
                      </td>

                      <td className="p-3">
                        {new Date(
                          item.releaseDate
                        ).toLocaleDateString()}
                      </td>

                      <td
                        className={`p-3 font-medium ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </td>

                      <td className="p-3">
                        <button
                          onClick={() =>
                            openRelease(item)
                          }
                          className="text-indigo-600"
                        >
                          View
                        </button>
                      </td>

                      <td className="p-3">
                        <button
                          onClick={() =>
                            deleteRelease(item.id)
                          }
                          className="text-red-500"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  {!releases.length && (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center p-6 text-gray-400"
                      >
                        No releases found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* DETAIL VIEW */}
          {view === "detail" && selected && (
            <div className="mt-10 border rounded p-6">
              <div className="flex justify-between items-center">
                <button
                  onClick={() =>
                    setView("list")
                  }
                  className="text-indigo-600 text-sm"
                >
                  All releases &gt;{" "}
                  {selected.name}
                </button>

                <button
                  onClick={() =>
                    deleteRelease(
                      selected.id
                    )
                  }
                  className="bg-indigo-600 text-white px-4 py-2 rounded text-sm"
                >
                  Delete
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <input
                  disabled
                  value={selected.name}
                  className="border rounded p-2 bg-gray-100"
                />

                <input
                  disabled
                  value={new Date(
                    selected.releaseDate
                  ).toLocaleDateString()}
                  className="border rounded p-2 bg-gray-100"
                />
              </div>

              <div className="space-y-3 mt-8">
                {STEPS.map((step) => (
                  <label
                    key={step}
                    className="flex gap-3 items-start"
                  >
                    <input
                      type="checkbox"
                      checked={
                        selected
                          .stepsCompleted?.[
                          step
                        ] || false
                      }
                      onChange={() =>
                        toggleStep(step)
                      }
                    />

                    <span>{step}</span>
                  </label>
                ))}
              </div>

              <div className="mt-8">
                <p className="font-medium mb-2">
                  Additional remarks /
                  tasks
                </p>

                <textarea
                  rows={6}
                  className="w-full border rounded p-3"
                  value={
                    selected.additionalInfo ||
                    ""
                  }
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      additionalInfo:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div className="mt-6 text-right">
                <button
                  onClick={saveInfo}
                  className="bg-indigo-600 text-white px-5 py-2 rounded"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}