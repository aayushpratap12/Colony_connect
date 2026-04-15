import { useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { RootState } from '@redux/store';

// Typed selector hook — use this everywhere instead of useSelector
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default useAppSelector;
