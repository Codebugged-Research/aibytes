import { useState, useEffect } from 'react';
import { getTopicPrefs } from '../utils/storage';
import { reorderUnitsByTopics } from '../utils/topics';

export const useCurriculum = () => {
  const [curriculum, setCurriculum] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/lessons/index.json')
      .then(r => r.json())
      .then(data => {
        const prefs = getTopicPrefs();
        const units = prefs.length ? reorderUnitsByTopics(data.units, prefs) : data.units;
        setCurriculum({ ...data, units });
      })
      .catch(() => setCurriculum({
        app: "AIBites",
        units: [
          {
            id: 0,
            title: "Orientation",
            tier: "Foundations",
            tierIcon: "🥉",
            lessons: [
              { id: "u0-l1", title: "What is AI, really?", icon: "🧠" },
              { id: "u0-l2", title: "AI vs ML vs Deep Learning", icon: "🍰" },
              { id: "u0-l3", title: "Narrow vs General AI", icon: "🎯" },
              { id: "u0-l4", title: "60-Second History: 1950 → ChatGPT", icon: "🕰️" },
              { id: "u0-l5", title: "How AI \"Thinks\" vs How You Think", icon: "🤔" }
            ]
          },
          {
            id: 1,
            title: "Data Foundations",
            tier: "Data Foundations",
            tierIcon: "📦",
            lessons: [
              { id: "u1-l1", title: "What is Data?", icon: "📦" },
              { id: "u1-l2", title: "Types of Data", icon: "🗂️" },
              { id: "u1-l3", title: "Structured vs Unstructured Data", icon: "🗄️" },
              { id: "u1-l4", title: "Where Data Comes From", icon: "📡" },
              { id: "u1-l5", title: "Databases & Big Data", icon: "🗃️" }
            ]
          },
          {
            id: 2,
            title: "Data Analytics",
            tier: "Data Analytics",
            tierIcon: "📊",
            lessons: [
              { id: "u2-l1", title: "What is Data Analytics?", icon: "🔎" },
              { id: "u2-l2", title: "Collecting & Cleaning Data", icon: "🧹" },
              { id: "u2-l3", title: "Exploring Data (EDA)", icon: "🕵️" },
              { id: "u2-l4", title: "Data Visualization", icon: "📈" },
              { id: "u2-l5", title: "Trends & Insights", icon: "💡" }
            ]
          }
        ]
      }))
      .finally(() => setLoading(false));
  }, []);

  return { curriculum, loading };
};

export const useLesson = (lessonId) => {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!lessonId) return;
    setLoading(true);
    fetch(`/lessons/${lessonId}.json`)
      .then(r => r.json())
      .then(data => setLesson(data))
      .catch(err => { setError(err.message); setLesson(null); })
      .finally(() => setLoading(false));
  }, [lessonId]);

  return { lesson, loading, error };
};
