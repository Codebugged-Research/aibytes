import { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

export const useCurriculum = () => {
  const [curriculum, setCurriculum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        const response = await axios.get(`${API}/curriculum`);
        setCurriculum(response.data);
      } catch (err) {
        console.warn('API error, falling back to local curriculum mock:', err.message);
        setError(err.message);
        setCurriculum({
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
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCurriculum();
  }, []);

  return { curriculum, loading, error };
};

export const useLesson = (lessonId) => {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!lessonId) return;

    const fetchLesson = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API}/lessons/${lessonId}`);
        setLesson(response.data);
      } catch (err) {
        console.warn(`API error, trying local fallback for lesson ${lessonId}:`, err.message);
        try {
          const localResponse = await axios.get(`/lessons/${lessonId}.json`);
          setLesson(localResponse.data);
        } catch (localErr) {
          console.warn(`Local fallback also failed for lesson ${lessonId}:`, localErr.message);
          setError(err.message);
          setLesson(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  return { lesson, loading, error };
};