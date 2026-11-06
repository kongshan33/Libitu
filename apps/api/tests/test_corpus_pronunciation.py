import pytest

from app.services.corpus_pronunciation import normalize_inflected_ipa


@pytest.mark.parametrize("source,learning,ipa,expected", [
    ("glimmers of hope", "glimmer of hope", "/ˈɡlɪmərz əv hoʊp/", "/ˈɡlɪmər əv hoʊp/"),
    ("pockets of greatness", "pocket of greatness", "/ˈpɑkɪts əv ˈɡreɪtnəs/", "/ˈpɑkɪt əv ˈɡreɪtnəs/"),
    ("drifted away from", "drift away from", "/drɪftɪd əˈweɪ frəm/", "/drɪft əˈweɪ frəm/"),
    ("drifted away from", "drift away from", "/drɪft əˈweɪ frəm/", "/drɪft əˈweɪ frəm/"),
    ("pockets of greatness", "pocket of greatness", "/ˈpɑkɪt əv ˈɡreɪtnəs/", "/ˈpɑkɪt əv ˈɡreɪtnəs/"),
    ("made ends meet", "make ends meet", "/meɪk ɛndz mit/", "/meɪk ɛndz mit/"),
    ("has drifted away", "drift away", "/drɪft əˈweɪ/", "/drɪft əˈweɪ/"),
    ("broke the ice", "break the ice", "/breɪk ði aɪs/", "/breɪk ði aɪs/"),
    ("glimmers of hope", "glimmers of hope", "/ˈɡlɪmərz əv hoʊp/", "/ˈɡlɪmərz əv hoʊp/"),
])
def test_only_dictionary_proven_redundant_inflection_is_removed(source, learning, ipa, expected):
    assert normalize_inflected_ipa(source, learning, ipa) == expected
