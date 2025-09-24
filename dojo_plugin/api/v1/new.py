import datetime

from CTFd.cache import cache
from CTFd.models import Solves, Users, db
from CTFd.plugins.challenges import get_chal_class
from CTFd.utils.decorators import admins_only, authed_only, ratelimit
from CTFd.utils.user import get_current_user, get_ip, is_admin
from flask import request
from flask_restx import Namespace, Resource
from sqlalchemy.sql import and_

from ...models import (DojoChallenges, DojoModules, Dojos, DojoStudents,
                       DojoUsers, Emojis, SurveyResponses)
from ...utils import is_challenge_locked, render_markdown
from ...utils.dojo import dojo_admins_only, dojo_create, dojo_route

new_namespace = Namespace(
    "new", description="Endpoint to retrieve Dojos"
)


@new_namespace.route("/test")
class Test(Resource):
    def get(self):
        user = get_current_user()
        return {"success": True}


@new_namespace.route("/<id>/test")
class Test(Resource):
    def get(self, id):
        
        user = get_current_user()
        return {"success": id}
