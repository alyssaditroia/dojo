from flask import request
from flask_restx import Namespace, Resource
from sqlalchemy.orm import joinedload
from sqlalchemy.sql import or_

from ...models import Dojos, DojoModules, DojoChallenges

search_namespace = Namespace("search", description="Search across dojos, modules, and challenges")

@search_namespace.route("")
class Search(Resource):
    def get(self):
        query = request.args.get("q", "").strip()

        if not query or len(query) < 2:
            return {"success": False, "error": "Query too short."}, 400

        like_query = f"%{query}%"

        dojos = Dojos.query.filter(
            or_(Dojos.name.ilike(like_query), Dojos.description.ilike(like_query))
        ).all()

        modules = DojoModules.query.options(joinedload(DojoModules.dojo)).filter(
            or_(DojoModules.name.ilike(like_query), DojoModules.description.ilike(like_query))
        ).all()

        challenges = DojoChallenges.query.options(
            joinedload(DojoChallenges.module).joinedload(DojoModules.dojo)
        ).filter(
            or_(DojoChallenges.name.ilike(like_query), DojoChallenges.description.ilike(like_query))
        ).all()

        return {
            "success": True,
            "results": {
                "dojos": [
                    {
                        "id": dojo.reference_id,
                        "name": dojo.name,
                        "link": f"/{dojo.reference_id}"
                    }
                    for dojo in dojos
                ],
                "modules": [
                    {
                        "id": module.id,
                        "name": module.name,
                        "dojo": {
                            "id": module.dojo.reference_id,
                            "name": module.dojo.name,
                            "link": f"/{module.dojo.reference_id}"
                        },
                        "link": f"/{module.dojo.reference_id}/{module.id}"
                    }
                    for module in modules
                ],
                "challenges": [
                    {
                        "id": challenge.id,
                        "name": challenge.name,
                        "module": {
                            "id": challenge.module.id,
                            "name": challenge.module.name,
                            "link": f"/{challenge.module.dojo.reference_id}/{challenge.module.id}"
                        },
                        "dojo": {
                            "id": challenge.module.dojo.reference_id,
                            "name": challenge.module.dojo.name,
                            "link": f"/{challenge.module.dojo.reference_id}"
                        },
                        "link": f"/{challenge.module.dojo.reference_id}/{challenge.module.id}/{challenge.id}"
                    }
                    for challenge in challenges
                ]
            }
        }
