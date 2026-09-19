"""Shared fixtures. Tests use the configured Postgres URL and roll back each case."""

from __future__ import annotations

import uuid
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import event
from sqlalchemy.orm import Session

from app.config import get_settings
from app.constants import Faculty, Role
from app.db import get_db, get_engine, init_db
from app.main import app
from app.models.user import User
from app.security import get_current_user, get_optional_user

@pytest.fixture(scope="session", autouse=True)
def _create_schema() -> None:
    if not get_settings().database_url:
        pytest.skip("DATABASE_URL is not set")
    init_db()


@pytest.fixture
def db_session() -> Generator[Session, None, None]:
    connection = get_engine().connect()
    transaction = connection.begin()
    session = Session(bind=connection)
    session.begin_nested()

    @event.listens_for(session, "after_transaction_end")
    def restart_savepoint(sess: Session, trans) -> None:
        if trans.nested and not trans._parent.nested:
            sess.begin_nested()

    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def computing_student(db_session: Session) -> User:
    user = User(
        id=uuid.uuid4(),
        email="test.computing@student.ucl.lk",
        full_name="Test Computing",
        role=Role.STUDENT.value,
        faculty=Faculty.COMPUTING.value,
        year=2,
        programme="Software Engineering",
        is_active=True,
    )
    db_session.add(user)
    db_session.flush()
    return user


@pytest.fixture
def business_student(db_session: Session) -> User:
    user = User(
        id=uuid.uuid4(),
        email="test.business@student.ucl.lk",
        full_name="Test Business",
        role=Role.STUDENT.value,
        faculty=Faculty.BUSINESS.value,
        year=1,
        programme="Business Management",
        is_active=True,
    )
    db_session.add(user)
    db_session.flush()
    return user


@pytest.fixture
def admin_user(db_session: Session) -> User:
    user = User(
        id=uuid.uuid4(),
        email="test.admin@ucl.lk",
        full_name="Test Admin",
        role=Role.ADMIN.value,
        is_active=True,
    )
    db_session.add(user)
    db_session.flush()
    return user


def _override_db(db_session: Session) -> None:
    def override() -> Generator[Session, None, None]:
        yield db_session

    app.dependency_overrides[get_db] = override


@pytest.fixture
def client(db_session: Session) -> Generator[TestClient, None, None]:
    _override_db(db_session)
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def computing_client(
    db_session: Session, computing_student: User
) -> Generator[TestClient, None, None]:
    _override_db(db_session)
    app.dependency_overrides[get_current_user] = lambda: computing_student
    app.dependency_overrides[get_optional_user] = lambda: computing_student
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def business_client(
    db_session: Session, business_student: User
) -> Generator[TestClient, None, None]:
    _override_db(db_session)
    app.dependency_overrides[get_current_user] = lambda: business_student
    app.dependency_overrides[get_optional_user] = lambda: business_student
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def admin_client(db_session: Session, admin_user: User) -> Generator[TestClient, None, None]:
    _override_db(db_session)
    app.dependency_overrides[get_current_user] = lambda: admin_user
    app.dependency_overrides[get_optional_user] = lambda: admin_user
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
