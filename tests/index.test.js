const BACKEND_URL = "http://localhost:3000";

describe("Authentication" , () =>{

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
    beforeAll(async() =>{
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
})

describe("User avatar endpoint" ,  () =>{
    let token;
    let avatarId;
    let userId;

    beforeAll(async() =>{
        const username = "testuser" + Math.random();
        const password = "testpassword"

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/auth/signup`, {
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
        userId = signupResponse.data.userId;
    })


    test("Get back the avatar information for a user " , async() =>{
        const response = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`)

        expect(response.data.avatars.length).toBe(1);
        expect(response.data.avatars[0].userId).toBe(userId);
    })

    test("Available avatars lists the recently created avatars" , async() =>{
        const response = await axios.get(`${BACKEND_URL}/api/v1/avatars`);
        expect(response.data.avatars.length).not.toBe(1);

        const currentAvatar = response.data.avatars.find(x => x.userId == avatarId);
        expect(currentAvatar).toBeDefined();   
    })
       


})

describe("Space information" ,  () =>{
    let mapId;
    let element1Id;
    let element2Id;
    let userToken;
    let userId;
    let adminToken;
    let adminId;

    beforeAll(async() =>{

        const username = "testuser" + Math.random();
        const password = "testpassword"

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/auth/signup`, {
            username,
            password,
            type: "admin" 
        })

        const response = await axios.post(`${BACKEND_URL}/api/v1/auth/signin`, {
            username,
            password,
        })

        adminToken = response.data .token;
        adminId = signupResponse.data.userId;

        const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/auth/signup`, {
            username :username + "-user",
            password,
            type: "user" 
        })

        const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/auth/signin`, {
            username:username+ "-user",
            password,
        })

        userToken = userSigninResponse.data .token;
        userId = userSignupResponse.data.userId;


        const element1 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        } , {
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        })

        const element2 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        } , {
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        })

        element1Id = element1.id;
        element2Id = element2.id;

        const map = await axios.post(`${BACKEND_URL}/api/v1/admin/map`,{
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "100 person interview room",
            "defaultElements": [{
                    elementId: element1Id,
                    x: 20,
                    y: 20
                }, {
                    elementId:element1Id,
                    x: 18,
                    y: 20
                }, {
                    elementId: element2Id,
                    x: 19,
                    y: 20
                }, {
                    elementId: element2Id,
                    x: 19,
                    y: 20
                }
            ]
            }, {
                headers: {
                    "authorization": `Bearer ${adminToken}`
                }
        })
        mapId = map.id

    })

    test("User is able to create a space" , async() =>{


        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name" : "Test", 
            "dimensions": "100x200",
            "mapId": mapId, 
        }, {
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })
        expect(response.spaceId).toBeDefined(); 
    })

    test("User is able to create a space without mapId (empty space)" , async() =>{

        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name" : "Test", 
            "dimensions": "100x200",
            // "mapId": mapId, 
        }, {
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })

        expect(response.spaceId).toBeDefined();   
    })

    test("User is not able to create a space without mapId and dimensions" , async() =>{

        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name" : "Test", 
            // "dimensions": "100x200",
            // "mapId": mapId, 
        }, {
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })

        expect(response.statusCode).toBe(400);
    })

    test("User is not able to delete a space that doesn't exist" , async() =>{

        const response = await axios.delete(`${BACKEND_URL}/api/v1/space/randomId`, {
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })

        expect(response.statusCode).toBe(400);
    })

    test("User is  able to delete a space that exist" , async() =>{
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name" : "Test", 
            "dimensions": "100x200",
            // "mapId": mapId, 
        }, {
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })
        const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${response.data.spaceId}`, {
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })

        expect(deleteResponse.statusCode).toBe(200);
    })

    test("User is not able to delete a space creaeted by another user" , async() =>{  
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name" : "Test", 
            "dimensions": "100x200",
            // "mapId": mapId, 
        }, {
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })

       const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${response.data.spaceId}`, {
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        })

        expect(deleteResponse.statusCode).toBe(400); 
    })

    test("Admin has no spaces initially" , async() =>{
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`,  {
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        })

        expect(response.data.spaces.length).toBe(0);
    })

    test("Admin has no spaces initially" , async() =>{
        const spaceCreateResponse = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name" : "Test", 
            "dimensions": "100x200",
            // "mapId": mapId, 
        }, {
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        })

        const response = await axios.get(`${BACKEND_URL}/api/v1/space/all` , {
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        })
        const filterSpace = response.data.spaces.find(x => x.spaceId == spaceCreateResponse.spaceId);
        expect(response.data.spaces.length).toBe(1);
        expect(filterSpace).toBeDefined();

    })
})

describe('Arena endpoint' , () =>{ 
    let mapId;
    let element1Id;
    let element2Id;
    let userToken;
    let userId;
    let adminToken;
    let adminId;
    let spaceId;

    beforeAll(async() =>{

        const username = "testuser" + Math.random();
        const password = "testpassword"

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/auth/signup`, {
            username,
            password,
            type: "admin" 
        })

        const response = await axios.post(`${BACKEND_URL}/api/v1/auth/signin`, {
            username,
            password,
        })

        adminToken = response.data .token;
        adminId = signupResponse.data.userId;

        const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/auth/signup`, {
            username :username + "-user",
            password,
            type: "user" 
        })

        const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/auth/signin`, {
            username: username + "-user",
            password,
        })

        userToken = userSigninResponse.data .token;
        userId = userSignupResponse.data.userId;


        const element1 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        } , {
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        })

        const element2 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        } , {
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        })

        element1Id = element1.id;
        element2Id = element2.id;

        const map = await axios.post(`${BACKEND_URL}/api/v1/admin/map`,{
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "100 person interview room",
            "defaultElements": [{
                    elementId: element1Id,
                    x: 20,
                    y: 20
                }, {
                    elementId:element1Id,
                    x: 18,
                    y: 20
                }, {
                    elementId: element2Id,
                    x: 19,
                    y: 20
                }, {
                    elementId: element2Id,
                    x: 19,
                    y: 20
                }
            ]
            }, {
                headers: {
                    "authorization": `Bearer ${adminToken}`
                }
        })
        mapId = map.id

        const space = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name" : "Test",
            "dimensions": "100x200",
            "mapId": mapId,
        } , {
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })

        spaceId = space.spaceId
    })

    test("Incorrect spaceId returns 400" , async() =>{
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/123456789` , {
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })
        expect(response.statusCode).toBe(400);
    })

    test("Correct spaceId returns all the elements " , async() =>{
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: {
                "authorization": `Bearer ${userToken}`
            }   
        })
        expect(response.data.dimensions).toBe("100x200");
        expect(response.data.elements.length).toBe(4);
    })

    test("Delete endpoint is able to delete an elements " , async() =>{
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}` , {
            headers: {
                "authorization": `Bearer ${userToken}`
            }   
        })

        await axios.delete(`${BACKEND_URL}/api/v1/space/element` , {
            spaceId, 
            elementId :response.data.elements[0].id,
        } , {
            headers: {
                "authorization": `Bearer ${userToken}`
            }   
        })

        const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}` , {
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })
        expect(newResponse.data.elements.length).toBe(3);
    })


    test("Adding an element fails if the element lies outside the dimensions" , async() =>{

        const newResponse =await axios.post(`${BACKEND_URL}/api/v1/space/element` , {
            "elementId": element1Id,
            "x": 50000,
            "y": 200000,
            "spaceId": spaceId,
        } , {
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })

        expect(newResponse.statusCode).toBe(400);
    })
    
    test("Adding an element works as expected " , async() =>{

        await axios.post(`${BACKEND_URL}/api/v1/space/element` , {
            "elementId": element1Id,
            "x": 50,
            "y": 20,
            "spaceId": spaceId,
        } , {
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })

        const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}` , {
            headers: {
                "authorization": `Bearer ${userToken}`
            }   
        })
        expect(newResponse.data.elements.length).toBe(4);
    })
})

describe