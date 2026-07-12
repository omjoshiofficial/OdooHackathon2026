import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppDataProvider } from './context/AppDataContext';
import AppRouter from './routes/AppRouter';

const App = () => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <AppDataProvider>
        <AppRouter />
        </AppDataProvider>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="colored"
          toastClassName="text-sm"
        />
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;
