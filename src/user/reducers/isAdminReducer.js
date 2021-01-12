
const initialState = {
    is_admin : false
}

export const isAdminReducer = (state = initialState, action) =>{
    
    switch(action.type){

        case 'ISADMIN' : return {
            is_admin : true
        }
        case 'ADMINLOGOUT' : return {
            is_admin : false
        }
        default : 
            return state
    }

}