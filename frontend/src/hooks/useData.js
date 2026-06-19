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
                { id: "u0-l3", title: "Narrow vs General AI", icon: "🎯" }
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
        console.warn(`API error, falling back to local mock for lesson ${lessonId}:`, err.message);
        setError(err.message);
        
        // Comprehensive fallback data matching the backend files
        const mockLessons = {
          'u0-l1': {
            id: 'u0-l1',
            title: 'What is AI, really?',
            icon: '🧠',
            content: [
              {
                type: 'text',
                value: 'Artificial Intelligence (AI) is the simulation of human intelligence processes by machines, especially computer systems.'
              },
              {
                type: 'text',
                value: 'These processes include learning (the acquisition of information and rules for using it), reasoning (using rules to reach approximate or conclusions), and self-correction.'
              }
            ],
            questions: [
              {
                id: 'q1',
                question: 'Which of these best describes AI?',
                options: [
                  'Machines simulating human intelligence processes',
                  'A simple calculator program',
                  'Any electrical appliance'
                ],
                answer: 0
              }
            ]
          },
          'u0-l2': {
            id: 'u0-l2',
            title: 'AI vs ML vs Deep Learning',
            icon: '🍰',
            content: [
              {
                type: 'text',
                value: 'AI is the broad concept of machines being able to carry out tasks in a way that we would consider smart.'
              },
              {
                type: 'text',
                value: 'Machine Learning (ML) is an application of AI based around the idea that we should be able to give machines access to data and let them learn for themselves.'
              },
              {
                type: 'text',
                value: 'Deep Learning (DL) is a subset of ML based on artificial neural networks.'
              }
            ],
            questions: [
              {
                id: 'q1',
                question: 'Which of the following is the subset of Machine Learning?',
                options: [
                  'Broad AI',
                  'Deep Learning',
                  'Robotics'
                ],
                answer: 1
              }
            ]
          },
          'u0-l3': {
            id: 'u0-l3',
            title: 'Narrow vs General AI',
            icon: '🎯',
            content: [
              {
                type: 'text',
                value: 'Narrow AI (or Weak AI) is AI that is programmed to perform a single, specific task.'
              },
              {
                type: 'text',
                value: 'General AI (or Strong AI) is AI that has human-like cognitive abilities, allowing it to find solutions to unfamiliar tasks.'
              }
            ],
            questions: [
              {
                id: 'q1',
                question: 'What type of AI is designed for a single specific task?',
                options: [
                  'General AI',
                  'Narrow AI',
                  'Super AI'
                ],
                answer: 1
              }
            ]
          }
        };
        setLesson(mockLessons[lessonId] || null);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  return { lesson, loading, error };
};