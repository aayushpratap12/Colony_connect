import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@redux/store';

// Typed dispatch hook — use this everywhere instead of useDispatch
const useAppDispatch = () => useDispatch<AppDispatch>();

export default useAppDispatch;
