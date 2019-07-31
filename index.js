const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.onCreateFlollower = functions.firestore
    .document('/followers/{userId}/userFollowers/{followerId}')
    .onCreate(async (snap, context) => {

        const { userId, followerId } = context.params;
        // ? create  followed users post
        const followedUserPostRef = admin
            .firestore()
            .collection('posts')
            .doc(userId)
            .collection('userPosts');

        // ? create following user's timeline 
        const timelinePostsRef = admin
            .collection('timeline')
            .doc(followerId)
            .collection('timelinePosts');

        // ? get user's followed post
        const querySnapshot = await followedUserPostRef.get();

        // ? add each user's post to following user's time line
        querySnapshot.forEach((doc) => {
            if (doc.exists) {
                const postId = doc.id;
                const postData = doc.data();
                timelinePostsRef.doc(postId)
                    .set(postData);
            }
        });
    });

exports.onDeleteFollower = functions.firestore
    .document('/followers/{userId}/userFollowers/{followerId}')
    .onDelete(async (snap, context) => {

        const { userId, followerId } = context.params;

        const timelinePostsRef = admin
            .collection('timeline')
            .doc(followerId)
            .collection('timelinePosts')
            .where('ownerId', '==', userId);

        const querySnapshot = await timelinePostsRef.get();

        querySnapshot.forEach((doc) => {
            if (doc.exists) {
                doc.ref.delete();
            }
        });
    });

exports.onCreatePost = functions.firestore
    .document('/posts/{userId}/userPosts/{postId}')
    .onCreate(async (snap, context) => {
        const postCreatedData = snap.data();
        const { userId, followerId } = context.params;

        const userFollowersRef = admin
            .firestore()
            .collection('followers')
            .doc(userId)
            .collection('usersFollowers');

        const querySnapshot = await userFollowersRef.get();
        querySnapshot.forEach((doc) => {
            if (doc.exists) {
                const followerId = doc.id;

                admin.firestore()
                    .collection('timeline')
                    .doc(followerId)
                    .collection('timelinePosts')
                    .doc(postId)
                    .set(postCreatedData);
            }
        });
    });



exports.onUpdatePost = functions.firestore
    .document('/posts/{userId}/userPosts/{postId}')
    .onUpdate(async (snap, context) => {
        const postUpdated = snap.after.data();
        const { userId, followerId } = context.params;

        const userFollowersRef = admin
            .firestore()
            .collection('followers')
            .doc(userId)
            .collection('usersFollowers');

        const querySnapshot = await userFollowersRef.get();
        querySnapshot.forEach((doc) => {
            if (doc.exists) {
                const followerId = doc.id;

                admin.firestore()
                    .collection('timeline')
                    .doc(followerId)
                    .collection('timelinePosts')
                    .doc(postId)
                    .get().then((doc) => {
                        if (doc.exists) {
                            doc.ref.update(postUpdated);
                        }
                    });

            }
        });
    });


exports.onDeletePost = functions.firestore
    .document('/posts/{userId}/userPosts/{postId}')
    .onDelete(async (snap, context) => {
        const { userId, followerId } = context.params;

        const userFollowersRef = admin
            .firestore()
            .collection('followers')
            .doc(userId)
            .collection('usersFollowers');

        const querySnapshot = await userFollowersRef.get();
        querySnapshot.forEach((doc) => {
            if (doc.exists) {
                const followerId = doc.id;

                admin.firestore()
                    .collection('timeline')
                    .doc(followerId)
                    .collection('timelinePosts')
                    .doc(postId)
                    .get().then((doc) => {
                        if (doc.exists) {
                            doc.ref.delete();
                        }
                    });

            }
        });
    });







