const BACKEND_URL = "http://localhost:3000";

describe("auth" , () =>{

    test('User is able to sign up', async () => { 
    
        const username = "testuser" + Math.random();
        const password = "testpassword"

        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type :"admin"
        })

        expect(response.statusCode).toBe(200);


        const response2 = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type :"admin"
        })


        expect(response2.statusCode).toBe(400);
    });

    test("Rejects if the username is not passed" , async() =>{
        const username = "testuser" + Math.random();
        const password = "testpassword"

        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            password,
            type :"admin"
        })

        expect(response.statusCode).toBe(400);
    })

    test("Signin fails if the username and password are correct" ,async () =>{
        const username = "testuser" + Math.random();
        const password = "testpassword"

        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
        })

        const response =await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password,
        })

        expect(response.statusCode).toBe(400);
        expect(response.body.token).toBeDefined();
    })

    test("Signin fails if the username and password are incorrect" , async() =>{
        const username = "testuser" + Math.random();
        const password = "testpassword"

        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
        })

        const response =await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: "wrongusername",
            password: "wrongpassword",
        })

        expect(response.statusCode).toBe(403);
    }) 
})

describe("User metadata endpoint" ,  () =>{

    let token;
    let avatarId
    BeforeAll(async() =>{
        const username = "testuser" + Math.random();
        const password = "testpassword"

        await axios.post(`${BACKEND_URL}/api/v1/auth/signup`, {
            username,
            password,
            type: "admin" 
        })

        const response = await axios.post(`${BACKEND_URL}/api/v1/auth/signin`, {
            username,
            password,
        })

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "Timmy"
        })
        avatarId = avatarResponse.data.avatarId;
        token = response.data .token;
    })

    test("User can't update their metadata with the wrong avatar ID" , async() =>{
        const response = await axios.put(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId: "123456789",
        } , {
            headers: {
                "authorization": `Bearer ${token}`
            }
        })  

        expect(response.statusCode).toBe(400);
    })

    test("User can update their metadata with the right avatar ID" , async() =>{
        const response = await axios.put(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId,
        } , {
            headers: {
                "authorization": `Bearer ${token}`
            }
        })  

        expect(response.statusCode).toBe(200);
    })

    test("User is not able to update their metadata without authorization" , async() =>{
        const response = await axios.put(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId,
        })  

        expect(response.statusCode).toBe(403);
        
    })



} )
