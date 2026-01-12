import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import AppLayout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './pages/Profile';
import DataSourceManagement from './pages/DataCollection/DataSourceManagement';
import CollectionTasks from './pages/DataCollection/CollectionTasks';
import CollectionTaskEditor from './pages/DataCollection/CollectionTaskEditor';
import DataCleaning from './pages/DataPreprocessing/DataCleaning';
import DataEnhancement from './pages/DataPreprocessing/DataEnhancement';
import PreprocessingOperators from './pages/DataPreprocessing/PreprocessingOperators';
import Overview from './pages/DataAnnotation/Overview';
import Projects from './pages/DataAnnotation/Projects';
import ProjectDetail from './pages/DataAnnotation/ProjectDetail';
import MyTasks from './pages/DataAnnotation/MyTasks';
import LabelTemplates from './pages/DataAnnotation/LabelTemplates';
import TaskTypes from './pages/DataAnnotation/TaskTypes';
import Annotate from './pages/DataAnnotation/Annotate';
import Datasets from './pages/Datasets';
import EvaluationTemplates from './pages/DatasetEvaluation/EvaluationTemplates';
import EvaluationMetrics from './pages/DatasetEvaluation/EvaluationMetrics';
import ModelManagement from './pages/Toolbox/ModelManagement';
import SceneConfig from './pages/Toolbox/SceneConfig';
import { useAuthStore } from './store/authStore';
import './App.css';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <AppLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="profile" element={<Profile />} />
            <Route path="data-collection">
              <Route path="sources" element={<DataSourceManagement />} />
              <Route path="tasks" element={<CollectionTasks />} />
              <Route path="tasks/create" element={<CollectionTaskEditor />} />
              <Route path="tasks/:id" element={<CollectionTaskEditor />} />
            </Route>
            <Route path="data-preprocessing">
              <Route path="cleaning" element={<DataCleaning />} />
              <Route path="enhancement" element={<DataEnhancement />} />
              <Route path="operators" element={<PreprocessingOperators />} />
            </Route>
            <Route path="data-annotation">
              <Route path="overview" element={<Overview />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="my-tasks" element={<MyTasks />} />
              <Route path="tasks" element={<MyTasks />} />
              <Route path="templates" element={<LabelTemplates />} />
              <Route path="task-types" element={<TaskTypes />} />
              <Route path="annotate/:taskId" element={<Annotate />} />
            </Route>
            <Route path="datasets" element={<Datasets />} />
            <Route path="dataset-evaluation">
              <Route path="templates" element={<EvaluationTemplates />} />
              <Route path="metrics" element={<EvaluationMetrics />} />
            </Route>
            <Route path="toolbox">
              <Route path="models" element={<ModelManagement />} />
              <Route path="scene-config" element={<SceneConfig />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
