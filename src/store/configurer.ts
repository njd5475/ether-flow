import {createStore, applyMiddleware} from 'redux'
import theReducer from '../reducers/root'
import thunk from 'redux-thunk'

export default function configureStore() : any {
  return createStore(
    theReducer,
    window['__REDUX_DEVTOOLS_EXTENSION__'] && window['__REDUX_DEVTOOLS_EXTENSION__'](),
    applyMiddleware(thunk)
  );
}
