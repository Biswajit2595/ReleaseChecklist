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
    try {
      const res = await axios.get(`${API}/api/releases`);
      setReleases(res.data);
    } catch (error) {
      console.error("Fetch releases failed:", error);
    }
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  const createRelease = async () => {
    if (!form.name || !form.releaseDate) return;

    try {
      await axios.post(`${API}/api/releases`, form);

      setForm({
        name: "",
        releaseDate: "",
        additionalInfo: "",
      });

      fetchReleases();
    } catch (error) {
      console.error("Create failed:", error);
    }
  };

  const openRelease = (item: Release) => {
    setSelected(item);
    setView("detail");
  };

  const toggleStep = async (stepName: string) => {
    if (!selected) return;

    try {
      const res = await axios.patch(
        `${API}/api/releases/${selected.id}/steps`,
        { stepName }
      );

      setSelected(res.data);
      fetchReleases();
    } catch (error) {
      console.error("Toggle step failed:", error);
    }
  };

  const saveInfo = async () => {
    if (!selected) return;

    try {
      await axios.patch(
        `${API}/api/releases/${selected.id}/info`,
        {
          additionalInfo: selected.additionalInfo,
        }
      );

      fetchReleases();
      setView("list");
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  const deleteRelease = async (id: number) => {
    try {
      await axios.delete(`${API}/api/releases/${id}`);

      fetchReleases();

      if (selected?.id === id) {
        setSelected(null);
        setView("list");
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const statusColor = (status: string) => {
    if (status === "done") return "text-green-600";
    if (status === "ongoing") return "text-yellow-600";
    return "text-gray-500";
  };

  return (
    <main className=" bg-[#f5f6f8]">
      <div className=" mx-auto bg-white rounded shadow-sm overflow-hidden">
        {/* Browser bar */}
        <div className="h-8 bg-gray-300" />

        <div className="px-14 py-10">
          {/* Header */}
          <h1 className="text-center text-5xl font-bold text-gray-800">
            ReleaseCheck
          </h1>

          <p className="text-center text-gray-500 mt-3 text-sm">
            Your all-in-one release checklist tool
          </p>

          {/* ================= LIST VIEW ================= */}
          {view === "list" && (
            <div className="mt-12 border rounded">
              {/* top row */}
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <span className="text-blue-600 text-sm">
                  All releases
                </span>

                <button
                  onClick={createRelease}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
                >
                  New release
                </button>
              </div>

              {/* create form */}
              <div className="grid md:grid-cols-3 gap-3 p-4 border-b">
                <input
                  className="border px-3 py-2 rounded text-sm"
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
                  className="border px-3 py-2 rounded text-sm"
                  value={form.releaseDate}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      releaseDate: e.target.value,
                    })
                  }
                />

                <input
                  className="border px-3 py-2 rounded text-sm"
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

              {/* table */}
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b text-left">
                    <th className="px-6 py-3">
                      Release
                    </th>
                    <th className="px-6 py-3">
                      Date
                    </th>
                    <th className="px-6 py-3">
                      Status
                    </th>
                    <th className="px-6 py-3">
                      View
                    </th>
                    <th className="px-6 py-3">
                      Delete
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {releases.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-6 py-3">
                        {item.name}
                      </td>

                      <td className="px-6 py-3">
                        {new Date(
                          item.releaseDate
                        ).toLocaleDateString()}
                      </td>

                      <td
                        className={`px-6 py-3 capitalize font-medium ${statusColor(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </td>

                      <td className="px-6 py-3">
                        <button
                          onClick={() =>
                            openRelease(item)
                          }
                          className="text-blue-600"
                        >
                          View
                        </button>
                      </td>

                      <td className="px-6 py-3">
                        <button
                          onClick={() =>
                            deleteRelease(
                              item.id
                            )
                          }
                          className="text-blue-600"
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
                        className="p-8 text-center text-gray-400"
                      >
                        No releases found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ================= DETAIL VIEW ================= */}
          {view === "detail" && selected && (
            <div className="mt-12 border rounded">
              {/* top row */}
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <button
                  onClick={() =>
                    setView("list")
                  }
                  className="text-blue-600 text-sm"
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
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
                >
                  Delete
                </button>
              </div>

              <div className="p-6 space-y-7">
                {/* Release */}
                <div className="grid grid-cols-[170px_1fr] gap-4 items-center">
                  <label className="text-sm text-gray-700">
                    Release
                  </label>

                  <input
                    disabled
                    value={selected.name}
                    className="border px-3 py-2 rounded bg-gray-100"
                  />
                </div>

                {/* Date */}
                <div className="grid grid-cols-[170px_1fr] gap-4 items-center">
                  <label className="text-sm text-gray-700">
                    Date
                  </label>

                  <input
                    disabled
                    value={new Date(
                      selected.releaseDate
                    ).toLocaleDateString()}
                    className="border px-3 py-2 rounded bg-gray-100"
                  />
                </div>

                {/* Checklist */}
                <div className="grid grid-cols-[170px_1fr] gap-4">
                  <label className="text-sm text-gray-700">
                    Checklist
                  </label>

                  <div className="space-y-3">
                    {Object.keys(
                      selected.stepsCompleted ||
                        {}
                    ).map((step) => (
                      <label
                        key={step}
                        className="flex gap-3 items-start"
                      >
                        <input
                          type="checkbox"
                          checked={
                            selected
                              .stepsCompleted[
                              step
                            ] || false
                          }
                          onChange={() =>
                            toggleStep(
                              step
                            )
                          }
                          className="mt-1"
                        />

                        <span className="text-sm text-gray-700">
                          {step}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="grid grid-cols-[170px_1fr] gap-4">
                  <label className="text-sm text-gray-700">
                    Additional
                    remarks / tasks
                  </label>

                  <textarea
                    rows={6}
                    className="border rounded p-3"
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

                {/* Save */}
                <div className="text-right">
                  <button
                    onClick={saveInfo}
                    className="bg-blue-600 text-white px-6 py-2 rounded"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}