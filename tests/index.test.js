const axios2 = require("axios");

const BACKEND_URL = "http://localhost:3000"
const WS_URL = "ws://localhost:3001"

const axios = {
    post: async (...args) => {
        try {
            const res = await axios2.post(...args)
            return res
        } catch(e) {
            return e.response
        }
    },
    get: async (...args) => {
        try {
            const res = await axios2.get(...args)
            return res
        } catch(e) {
            return e.response
        }
    },
    put: async (...args) => {
        try {
            const res = await axios2.put(...args)
            return res
        } catch(e) {
            return e.response
        }
    },
    delete: async (...args) => {
        try {
            const res = await axios2.delete(...args)
            return res
        } catch(e) {
            return e.response
        }
    },
}


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
        expect(response.data.token).toBeDefined();
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
        } , {
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
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
        } , {
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
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


        const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        } , {
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        })

        const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        } , {
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        })

        element1Id = element1Response.data.id;
        element2Id = element2Response.data.id;

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`,{
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
        mapId = mapResponse.id

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
        expect(response.data.spaceId).toBeDefined(); 
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

        expect(response.data.spaceId).toBeDefined();   
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


        const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        } , {
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        })

        const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        } , {
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        })

        element1Id = element1Response.data.id;
        element2Id = element2Response.data.id;

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`,{
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
        mapId = mapResponse.id

        const spaceResponse = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name" : "Test",
            "dimensions": "100x200",
            "mapId": mapId,
        } , {
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })

        spaceId = spaceResponse.data.spaceId
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

describe("Admin Endpoint" , () =>{ 
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
            username: username + "-user",
            password,
        })

        userToken = userSigninResponse.data .token;
        userId = userSignupResponse.data.userId;

    })

    test("User is not able to hit the admin endpoint" , async() =>{ 
        const elementResponse  = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, { 
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        } ,{
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        });


        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "100 person interview room",
            "defaultElements": [  ]
            }, {
                headers: {
                    "authorization": `Bearer ${userToken}`
                }
        })


        const avatarResponse = await axios.get(`${BACKEND_URL}/api/v1/admin/avatars`, {
            "imageUrl" : "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "name": "Timmy"
        } , {
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })

        const updateElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/123`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        } , {
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })

        expect(elementResponse.statusCode).toBe(403);
        expect(mapResponse.statusCode).toBe(403);
        expect(avatarResponse.statusCode).toBe(403);
        expect(updateElementResponse.statusCode).toBe(403);

    })

    test("Admin is  able to hit the admin endpoint" , async() =>{ 
        const elementResponse  = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, { 
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        } ,{
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        });

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "100 person interview room",
            "defaultElements": [  ]
            }, {
                headers: {
                    "authorization": `Bearer ${adminToken}`
                }
        })

        const avatarResponse = await axios.get(`${BACKEND_URL}/api/v1/admin/avatars`, {
            "imageUrl" : "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "name": "Timmy"
        } , {
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        })

        expect(elementResponse.statusCode).toBe(200);
        expect(mapResponse.statusCode).toBe(200);
        expect(avatarResponse.statusCode).toBe(200);
    })

    test("Admin is able to update the imageUrl of an element" , async() =>{

        const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        } , {
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        })
        const updateElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/${elementResponse.data.id}`, { 
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        } , {
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        })

        expect(updateElementResponse.statusCode).toBe(200);
    })
})

//WebSockets
describe("WebSockets tests" , () =>{
    let adminToken;
    let adminUserId;
    let userToken;
    let userId;
    let element1Id;
    let element2Id;
    let mapId;
    let spaceId;
    let ws1;
    let ws2;
    let ws1Messages = [];
    let ws2Messages = [];
    let userX;
    let userY;
    let adminX;
    let adminY;

    function waitForandPopLatestMessage(messageArray){
        return new Promise((r) => {
            if(messageArray.length > 0){
                 resolve(messageArray.shift());
            }else {
                let interval = setInterval(() =>{
                    if(messageArray.length > 0){
                        resolve(messageArray.shift());
                        clearInterval(interval);
                    }
                }, 100);
            }
        })
    }

    async function setupHTTP(){
        const username = "testuser" + Math.random();
        const password = "testpassword"

        const adminSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            role :"admin"
        })
        adminUserId = adminSignupResponse.data.userId;


        const adminSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password,
        })

        adminToken = adminSigninResponse.data.token

        const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username :username + "-user",
            password,
            type: "user" 
        })

        const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username + "-user",
            password,
        })

        userId = userSignupResponse.data.userId;
        userToken = userSigninResponse.data.token;

        const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        } , {
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        })

        const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        } , {
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        })

        element1Id = element1Response.data.id;
        element2Id = element2Response.data.id;

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`,{
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
        mapId = mapResponse.id

        const spaceResponse = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name" : "Test",
            "dimensions": "100x200",
            "mapId": mapId,
        } , {
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })

        spaceId = spaceResponse.data.spaceId

    }

    async function setupWS(){
        ws1 = new WebSocket(WS_URL);
        await new Promise(resolve => ws1.onopen = resolve);
        ws1.onmessage = function(event) {
            ws1Messages.push(JSON.parse(event.data));
        }

        ws2 = new WebSocket(WS_URL);
        await new Promise(resolve => ws2.onopen = resolve);
        ws2.onmessage = function(event) {
            ws2Messages.push(JSON.parse(event.data));
        }

    
    }

    beforeAll(async() =>{
        setupHTTP();
        setupWS();
    })  

    test("Get back the ack for joining a space" , async() =>{
        ws1.send(JSON.stringify({
            "type": "join",
            "payload": {    
                "spaceId": spaceId,
                "token": adminToken
            }
        }))
        const  message1 = await waitForandPopLatestMessage(ws1Messages);

        ws2.send(JSON.stringify({
            "type": "join",
            "payload": {    
                "spaceId": spaceId,
                "token": userToken
            }
        }))

        expect(message1.type).toBe("space-joined");

        const  message2 = await waitForandPopLatestMessage(ws2Messages);
        expect(message2.type).toBe("space-joined");

        const  message3 = await waitForandPopLatestMessage(ws1Messages);


        expect(message1.payload.users.length).toBe(0);
        expect(message2.payload.users.length).toBe(1);
        expect(message3.type).toBe("user-joined");
        expect(message3.payload.x).toBe(message2.payload.spawn.x);
        expect(message3.payload.y).toBe(message2.payload.spawn.y);
        expect(message3.payload.userId).toBe(userId);




        

        adminX = message1.payload.spawn.x;
        adminY = message1.payload.spawn.y;

        userX = message2.payload.spawn.x;    
        userY = message2.payload.spawn.y;
    })

    test("User should not be able to move across the boundary of the wall" , async() =>{
        ws1.send(JSON.stringify({
            "type": "movement",
            "payload": {    
                "x": 100000,
                "y": 100000
            }
        }))

        const  message1 = await waitForandPopLatestMessage(ws1Messages);
        expect(message1.type).toBe("movement-rejected");
        expect(message1.payload.x).toBe(adminX);
        expect(message1.payload.y).toBe(adminY);
        
    })

    test("User should not be able to move two blocks at the same time" , async() =>{
        ws1.send(JSON.stringify({
            "type": "movement",
            "payload": {    
                "x": adminX  + 2,
                "y": adminY
            }
        }))

        const  message1 = await waitForandPopLatestMessage(ws1Messages);
        expect(message1.type).toBe("movement-rejected");
        expect(message1.payload.x).toBe(adminX);
        expect(message1.payload.y).toBe(adminY);
        
    })

    test("Correct movement should be broadcasted to all the sockets in the room" , async() =>{
        ws1.send(JSON.stringify({
            "type": "movement",
            "payload": {    
                "x": adminX  + 1,
                "y": adminY,
                "userId": adminId

            }
        }))

        const  message1 = await waitForandPopLatestMessage(ws2Messages);
        expect(message1.type).toBe("movement-rejected");
        expect(message1.payload.x).toBe(adminX +1);
        expect(message1.payload.y).toBe(adminY);
        
    })

    test("if the user leave the room the other user recieves a leave event" , async() =>{
        ws1.close();

        const  message1 = await waitForandPopLatestMessage(ws2Messages);
        expect(message1.type).toBe("user-left");
        expect(message1.payload.userId).toBe(adminUserId);
        
    })
})